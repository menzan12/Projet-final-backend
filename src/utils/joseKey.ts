import { createHash } from "crypto";

// Cette méthode transforme n'importe quelle chaîne en une clé de 256 bits (32 octets)
const secret = process.env.JWT_SECRET || "une_cle_par_defaut_tres_longue_et_securisee";

export const JoseSecretkey = createHash("sha256")
  .update(secret)
  .digest();