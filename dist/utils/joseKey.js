"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoseSecretkey = void 0;
const crypto_1 = require("crypto");
// Cette méthode transforme n'importe quelle chaîne en une clé de 256 bits (32 octets)
const secret = process.env.JWT_SECRET || "une_cle_par_defaut_tres_longue_et_securisee";
exports.JoseSecretkey = (0, crypto_1.createHash)("sha256")
    .update(secret)
    .digest();
