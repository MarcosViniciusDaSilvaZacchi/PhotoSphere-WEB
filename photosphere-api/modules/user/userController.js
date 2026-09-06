/**
 * modules/user/userController.js — Controlador de usuários.
 */

const userService = require('./userService');

exports.register = async (req, res) => {
  const { username, email, password, fullName } = req.body;
  const newUser = await userService.registerUser(username, email, password, fullName);
  return res.success('Conta criada com sucesso! Faça login para continuar.', newUser, 201);
};

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
  const user = await userService.getPublicProfile(req.params.username);
  return res.success('Perfil obtido com sucesso', user);
};

