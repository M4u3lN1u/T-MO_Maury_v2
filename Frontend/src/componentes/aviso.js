// Muestra un mensaje breve en pantalla
export const aviso = (texto) => window.dispatchEvent(new CustomEvent('aviso', { detail: texto }))
