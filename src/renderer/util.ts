function pathname(p: String): String {
  return p.substring(p.lastIndexOf("/") + 1);
}