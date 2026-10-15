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

  try {
    const data = await userService.loginUser(email, password);
    return res.success('Login realizado com sucesso!', data);
  } catch (err) {
    // Se o banco MySQL não estiver acessível, permitir apenas o login ADM hardcoded
    if (err.name?.includes('Sequelize') || err.code === 'ECONNREFUSED' || err.parent?.code === 'ECONNREFUSED') {
      if (email === 'ADM' && password === '123456') {
        const { generateToken } = require('../../config/jwt');
        const token = generateToken({ id: 1, username: 'ADM', isAdmin: true });
        return res.success('Login realizado com sucesso!', {
          token,
          user: {
            id: 1,
            username: 'ADM',
            email: 'adm@photosphere.com',
            fullName: 'Administrador',
            profilePicture: 'default-profile.png',
            isAdmin: true,
          },
        });
      }
      // Credenciais inválidas mesmo em modo dev
      return res.error('Credenciais inválidas. Verifique seu usuário/e-mail e senha.', null, 401);
    }
    throw err;
  }
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

