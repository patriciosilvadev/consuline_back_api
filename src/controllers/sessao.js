const loginProfissionalDaSaudeController = require("../controllers/loginProfissionalDaSaude");
const Central = require("../models/Central");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../config/auth.json");

module.exports = {
  async logar(req, res) {
    try {
      const { login, senha } = req.body;

      const central = await Central.findOne({
        where: { login: login },
        attributes: ["login", "id", "senha"],
        raw: true,
      });

      if (central) {
        if (bcrypt.compareSync(senha, central.senha)) {

          const token = jwt.sign({ idCentral: central.id, tipoPerfil:"admin" }, auth.secret);

          return res.status(200).send({ id: central.id, login: central.login, token });
        } else {
          return res.status(404).send({ erro: "Senha da central inválida" });
        }
      } else {
        const profissionalSaude = await loginProfissionalDaSaudeController.validaProfissional(
          login,
          senha
        );

        if (profissionalSaude) {
          const retorno = await loginProfissionalDaSaudeController.loginProfissionalDaSaude(
            profissionalSaude
          );

          return res.status(200).send(retorno);
        }
      }
    } catch (error) {
      console.log(error);
      console.log({ erro: "Falha no login" });
    }
  },
};
