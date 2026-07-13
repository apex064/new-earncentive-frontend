export function getInitials(fullname: string) {
  if (!fullname) return "";

  const names = fullname.trim().split(/\s+/);

  const firstInitial = names[0].charAt(0);
  const lastInitial = names.length > 1 ? names[names.length - 1].charAt(0) : "";

  return (firstInitial + lastInitial).toUpperCase();
}
