export const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;
