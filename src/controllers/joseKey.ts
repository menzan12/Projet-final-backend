// Assure-toi que JOSE_SECRET dans .env est une chaîne de 32 caractères minimum
export const JoseSecretkey = new TextEncoder().encode(
    process.env.JWT_SECRET || "une_cle_secrete_de_secours_de_32_chars"
);