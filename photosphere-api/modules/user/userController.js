/**
 * modules/user/userController.js — Controlador de usuários.
 */

const userService = require('./userService');

exports.register = async (req, res) => {
  const { username, email, password, fullName } = req.body;
  const newUser = await userService.registerUser(username, email, password, fullName);
  return res.success('Conta criada com sucesso! Faça login para continuar.', newUser, 201);
};

// Aula 15: sem o login "ADM/123456" que funcionava com o banco fora do ar (pendência do
// checkpoint-02.md) — virar administrador agora só pelo scripts/setAdmin.js, no servidor.
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const data = await userService.loginUser(email, password);
  return res.success('Login realizado com sucesso!', data);
};

exports.logout = async (req, res) => {
  // Em arquitetura JWT stateless, o logout é realizado no cliente descartando o token.
  return res.success('Logout realizado com sucesso!');
};

exports.getMyProfile = async (req, res) => {
  // req.user foi injetado pelo middleware isAuthenticated
  const user = await userService.getUserProfile(req.user.id);
  return res.success('Perfil obtido com sucesso', user);
};

exports.updateProfile = async (req, res) => {
  const { fullName, bio } = req.body;
  const updatedUser = await userService.updateUserProfile(
    req.user.id,
    { fullName, bio },
    req.file
  );
  return res.success('Perfil atualizado com sucesso!', updatedUser);
};

exports.getPublicProfile = async (req, res) => {
  // optionalAuth: req.user só existe se veio um token válido
  const currentUserId = req.user ? req.user.id : null;
  const user = await userService.getPublicProfile(req.params.username, currentUserId);
  return res.success('Perfil obtido com sucesso', user);
};

