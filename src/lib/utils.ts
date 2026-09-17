export function generateCandidateCode(name: string): string {
  // Uppercase letters only
  let cleanName = name.toUpperCase();
  // Remove spaces and accents, keep alphanumerics
  cleanName = cleanName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  cleanName = cleanName.replace(/[^A-Z0-9]/g, '');

  if (cleanName.length < 5) {
    cleanName = cleanName.padEnd(5, 'X');
  }

  // Take first 3 letters + last 2 letters
  const prefix = cleanName.substring(0, 3) + cleanName.substring(cleanName.length - 2);
  
  // Append a 3-digit unique suffix (random for now, could be sequential from DB)
  const suffix = Math.floor(100 + Math.random() * 900).toString(); // 3 digits
  
  return prefix + suffix;
}
