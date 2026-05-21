import * as React from 'react';
import { webFrame } from 'electron';

const MIN_SCALE = 1;
const MAX_SCALE = 6;

// Sensitivity for pinch-to-zoom via trackpad (ctrlKey+wheel in Chromium/Electron).
// Electron reports pinch deltas as deltaY values roughly in the -5 to -100 range
// per event.  0.006 gives a natural feel without being too jumpy.
const ZOOM_WHEEL_SENSITIVITY = 0.006;

// Multiplier applied to scroll delta when panning a zoomed image.
// 1 = 1:1 pixel mapping, increase for faster panning.
const PAN_WHEEL_MULTIPLIER = 1;

// Target scale reached by a single double-click zoom gesture.
const DOUBLE_CLICK_ZOOM = 2;

// Module-level counter so we can call setVisualZoomLevelLimits exactly once
// across all mounted InteractiveMediaZoom instances and restore it only when
// the very last instance unmounts.
let _mountedInstanceCount = 0;

type Point = { x: number; y: number };

type Props = {
  mediaKey: string;
  disabled?: boolean;
  onZoomStateChange?(isZoomed: boolean): void;
  children?: React.ReactNode;
};

type State = {
  scale: number;
  translateX: number;
  translateY: number;
};

export default class InteractiveMediaZoom extends React.PureComponent<
  Props,
  State
> {
  readonly state: State = {
    scale: 1,
    translateX: 0,
    translateY: 0,
  };

  readonly containerRef: React.RefObject<HTMLDivElement> = React.createRef();
  isDragging = false;
  dragOrigin: Point | null = null;
  // Tracks the last zoomed/unzoomed state we reported to the parent so we only
  // fire onZoomStateChange when the boolean actually flips, not on every scale update.
  lastAnnouncedZoomed = false;

  componentDidMount() {
    const el = this.containerRef.current;
    if (!el) return;

    // Prevent Electron's native visual page zoom from competing with our custom
    // zoom handler.  Without this lock, ctrl+scroll (which is how Chromium/Electron
    // delivers trackpad pinch gestures) would both zoom the entire webFrame AND
    // trigger our wheel handler at the same time.
    // setVisualZoomLevelLimits(1, 1) pins the page at 100% permanently.
    _mountedInstanceCount++;
    if (_mountedInstanceCount === 1) {
      webFrame.setVisualZoomLevelLimits(1, 1);
    }

    // Listen at document level in CAPTURE phase so we receive wheel events even
    // when a higher z-index element (the Player's IdleTimer overlay at z:999) is
    // the actual event target.  Capture fires before the event reaches any
    // element, so we always get it first regardless of which element is on top.
    // { passive: false } is required to be able to call preventDefault().
    document.addEventListener('wheel', this.onWheel as EventListener, {
      passive: false,
      capture: true,
    });
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    // Reset zoom whenever the displayed media changes (new image or video loaded).
    if (prevProps.mediaKey !== this.props.mediaKey) {
      this.resetZoom();
      return;
    }

    // Notify the parent only when the zoomed/unzoomed boolean flips to avoid
    // triggering unnecessary re-renders of ImageView on every tiny scale change.
    if (prevState.scale !== this.state.scale) {
      const isZoomed = this.state.scale > 1.001;
      if (isZoomed !== this.lastAnnouncedZoomed) {
        this.lastAnnouncedZoomed = isZoomed;
        if (this.props.onZoomStateChange) {
          this.props.onZoomStateChange(isZoomed);
        }
      }
    }
  }

  componentWillUnmount() {
    document.removeEventListener('wheel', this.onWheel as EventListener, {
      capture: true,
    } as EventListenerOptions);

    // Restore Electron's default visual zoom limits when the last instance unmounts.
    // 0.25–5 are Electron's built-in defaults.
    _mountedInstanceCount--;
    if (_mountedInstanceCount === 0) {
      // webFrame.setVisualZoomLevelLimits(0.25, 5);
    }

    // If we are unmounted while zoomed, tell the parent so it can re-enable
    // automatic animations (ZoomMove, Panning) that were paused.
    if (this.lastAnnouncedZoomed && this.props.onZoomStateChange) {
      this.props.onZoomStateChange(false);
    }
  }

  // Returns the maximum allowed translation offsets for a given scale.
  // At scale S the content is S× larger, centered, so each edge extends
  // (S-1)/2 * dimension pixels beyond the container — that is the pan budget.
  getBounds(scale = this.state.scale) {
    const el = this.containerRef.current;
    const width = el?.clientWidth || 0;
    const height = el?.clientHeight || 0;
    return {
      maxX: Math.max(0, ((scale - 1) * width) / 2),
      maxY: Math.max(0, ((scale - 1) * height) / 2),
    };
  }

  clampScale(value: number) {
    if (value < MIN_SCALE) return MIN_SCALE;
    if (value > MAX_SCALE) return MAX_SCALE;
    return value;
  }

  clampTranslate(x: number, y: number, scale = this.state.scale) {
    const bounds = this.getBounds(scale);
    return {
      x: Math.max(-bounds.maxX, Math.min(bounds.maxX, x)),
      y: Math.max(-bounds.maxY, Math.min(bounds.maxY, y)),
    };
  }

  // Central state setter — always goes through clamping so scale and translation
  // are guaranteed to stay within legal bounds.
  setZoomState(
    nextScale: number,
    nextTranslateX: number,
    nextTranslateY: number,
  ) {
    const scale = this.clampScale(nextScale);
    const clamped = this.clampTranslate(nextTranslateX, nextTranslateY, scale);
    this.setState({
      scale,
      // Reset translation to zero when back at 1:1 to clear any residual offset.
      translateX: scale <= 1 ? 0 : clamped.x,
      translateY: scale <= 1 ? 0 : clamped.y,
    });
  }

  // Zoom toward/away from a specific screen coordinate so the content under the
  // cursor stays visually fixed.  The translation is adjusted by the scale ratio
  // to compensate for the shift introduced by the new scale.
  zoomAroundPoint(nextScale: number, clientX: number, clientY: number) {
    const el = this.containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    // Vector from the container center to the zoom focus point.
    const fromCenterX = clientX - rect.left - rect.width / 2;
    const fromCenterY = clientY - rect.top - rect.height / 2;

    const currentScale = this.state.scale;
    const clampedScale = this.clampScale(nextScale);
    if (clampedScale === currentScale) return; // already at limit, nothing to do

    // Scale ratio between new and old — used to keep the focus point stationary.
    const ratio = clampedScale / currentScale;
    const nextTranslateX =
      this.state.translateX * ratio + fromCenterX * (1 - ratio);
    const nextTranslateY =
      this.state.translateY * ratio + fromCenterY * (1 - ratio);
    this.setZoomState(clampedScale, nextTranslateX, nextTranslateY);
  }

  // Shift the viewport by (deltaX, deltaY) pixels.  No-op when not zoomed in.
  panBy(deltaX: number, deltaY: number) {
    if (this.state.scale <= 1) return;
    // Subtract delta so scroll direction matches natural two-finger swipe convention
    // (positive deltaY = scroll down = content moves up = translateY decreases).
    this.setZoomState(
      this.state.scale,
      this.state.translateX - deltaX,
      this.state.translateY - deltaY,
    );
  }

  resetZoom = () => {
    this.setState({ scale: 1, translateX: 0, translateY: 0 });
  };

  onWheel = (event: WheelEvent) => {
    // Because we listen at document capture level (to bypass the z:999 IdleTimer
    // overlay), we must manually check that the cursor is within our container
    // before doing anything — otherwise we'd intercept wheel events from other
    // parts of the UI (e.g. scrollable menus).
    const el = this.containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) return;

    if (this.props.disabled) return;

    // On macOS, Chromium/Electron translates trackpad pinch gestures into wheel
    // events with ctrlKey forced to true — even when Ctrl is not physically held.
    // This is the standard Chromium way to detect pinch-to-zoom; there are no
    // separate gesturestart/gesturechange/gestureend events in Chromium (those
    // are WebKit/Safari-only and do not fire in Electron).
    if (event.ctrlKey) {
      event.preventDefault();
      event.stopPropagation();
      // deltaY is negative when pinching out (zoom in) and positive when pinching
      // in (zoom out), so we negate it before scaling.
      const nextScale =
        this.state.scale + -event.deltaY * ZOOM_WHEEL_SENSITIVITY;
      this.zoomAroundPoint(nextScale, event.clientX, event.clientY);
      return;
    }

    // When already zoomed in, consume normal two-finger scroll and use it to pan
    // so the user can inspect different parts of the image without accidentally
    // advancing the slideshow.
    if (this.state.scale > 1.001) {
      event.preventDefault();
      event.stopPropagation();
      this.panBy(
        event.deltaX * PAN_WHEEL_MULTIPLIER,
        event.deltaY * PAN_WHEEL_MULTIPLIER,
      );
    }
  };

  // --- Pointer events for click-drag panning when zoomed in ---

  onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (this.props.disabled || this.state.scale <= 1.001) return;
    this.isDragging = true;
    this.dragOrigin = { x: event.clientX, y: event.clientY };
    // Capture the pointer so we keep receiving move events even if the cursor
    // temporarily leaves the element bounds.
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!this.isDragging || !this.dragOrigin || this.state.scale <= 1.001)
      return;

    const deltaX = event.clientX - this.dragOrigin.x;
    const deltaY = event.clientY - this.dragOrigin.y;
    this.dragOrigin = { x: event.clientX, y: event.clientY };
    // Add delta (not subtract) because drag moves content in the same direction
    // as the pointer, unlike scroll which uses the inverted pan convention.
    this.setZoomState(
      this.state.scale,
      this.state.translateX + deltaX,
      this.state.translateY + deltaY,
    );
  };

  onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    this.isDragging = false;
    this.dragOrigin = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  // Double-click zooms in to DOUBLE_CLICK_ZOOM× at the clicked position.
  // A second double-click while already zoomed resets back to 1:1.
  onDoubleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (this.props.disabled) return;

    if (this.state.scale > 1.05) {
      this.resetZoom();
      return;
    }

    this.zoomAroundPoint(DOUBLE_CLICK_ZOOM, event.clientX, event.clientY);
  };

  render() {
    const { children } = this.props;
    const { scale, translateX, translateY } = this.state;
    const isZoomed = scale > 1.001;

    return (
      // Outer container: fills the player area and clips overflow so zoomed
      // content does not bleed outside the slide frame boundaries.
      <div
        ref={this.containerRef}
        onDoubleClick={this.onDoubleClick}
        onPointerDown={this.onPointerDown}
        onPointerMove={this.onPointerMove}
        onPointerUp={this.onPointerUp}
        onPointerCancel={this.onPointerUp}
        onPointerLeave={this.onPointerUp}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          overflow: 'hidden',
          // touchAction: none prevents the browser's own touch/trackpad gestures
          // from interfering with our manual pointer event handling.
          touchAction: 'none',
          cursor: isZoomed
            ? this.isDragging
              ? 'grabbing'
              : 'grab'
            : 'default',
        }}
      >
        {/* Inner wrapper that receives the CSS transform.  Kept separate from the
            clipping container so the transform-origin math stays simple and the
            compositor can promote it to its own GPU layer via willChange. */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
            transformOrigin: '50% 50%',
            // Hint to the GPU compositor to promote this element to its own layer
            // for smooth 60fps zoom/pan animations without repaints.
            willChange: 'transform',
          }}
        >
          {children}
        </div>
      </div>
    );
  }
}

(InteractiveMediaZoom as any).displayName = 'InteractiveMediaZoom';
