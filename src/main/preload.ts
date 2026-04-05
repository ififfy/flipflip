import { contextBridge, ipcRenderer } from 'electron'
import {IPC} from "../renderer/data/const";

contextBridge.exposeInMainWorld('ipc', {
  newWindow: () => ipcRenderer.send(IPC.newWindow)
})