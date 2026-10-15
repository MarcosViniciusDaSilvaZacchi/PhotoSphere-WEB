/**
 * modules/user/userService.js — Camada de regras de negócio e dados do usuário.
 */

const User = require('./userModel');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../../config/jwt');

async function registerUser(username, email, password, fullName) {
  const emailExists = await User.findOne({ where: { email } });
  const usernameExists = await User.findOne({ where: { username } });

  if (emailExists || usernameExists) {
    throw new Error('Este e-mail ou usuário já está cadastrado.');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
    fullName,
  });

  return {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
  };
}

async function loginUser(emailOrUsername, password) {
  // Permite login tanto por e-mail quanto por username
  const user = await User.findOne({
    where: {
      [require('sequelize').Op.or]: [
        { email: emailOrUsername },
        { username: emailOrUsername },
      ],
    },
  });

  if (!user) {
    throw new Error('Credenciais inválidas. Verifique seu usuário/e-mail e senha.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Credenciais inválidas. Verifique seu usuário/e-mail e senha.');
  }

  if (user.isBlocked) {
    const error = new Error('Esta conta foi bloqueada.');
    error.status = 403;
    throw error;
  }

  const tokenPayload = {
    id: user.id,
    username: user.username,
    isAdmin: user.isAdmin,
  };

  const token = generateToken(tokenPayload);

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      profilePicture: user.profilePicture,
      isAdmin: user.isAdmin,
    },
  };
}

async function getUserProfile(userId) {
  const user = await User.findByPk(userId, {
    attributes: [
      'id',
      'username',
      'email',
      'fullName',
      'bio',
      'profilePicture',
      'followersCount',
      'followingCount',
      'photosCount',
      'isAdmin',
    ],
  });

  if (!user) {
    const error = new Error('Usuário não encontrado.');
    error.status = 404;
    throw error;
  }

  return user;
}

/**
 * GET /api/profile/:username — perfil público com a lista de fotos da pessoa (Aula 09).
 *
 * As fotos vêm pelo include da associação User.hasMany(Photo, as: 'photos').
 * A ordenação de um include precisa ficar no NÍVEL DE CIMA da consulta,
 * apontando para o modelo associado — um "order" dentro do include é ignorado
 * pelo Sequelize nesse tipo de consulta.
 *
 * @param {string} username
 * @param {number|null} currentUserId - quem está vendo (via optionalAuth)
 */
async function getPublicProfile(username, currentUserId = null) {
  const Photo = require('../photo/photoModel');

  const user = await User.findOne({
    where: { username },
    attributes: [
      'id',
      'username',
      'fullName',
      'bio',
      'profilePicture',
      'followersCount',
      'followingCount',
      'photosCount',
      'createdAt',
    ],
    include: [
      {
        model: Photo,
        as: 'photos',
        // Aula 10: contadores de curtidas e comentários nos cards do perfil
        attributes: ['id', 'title', 'description', 'imageUrl', 'userId', 'viewsCount', 'likesCount', 'commentsCount', 'createdAt'],
      },
    ],
    order: [[{ model: Photo, as: 'photos' }, 'createdAt', 'DESC'], [{ model: Photo, as: 'photos' }, 'id', 'DESC']],
  });

  if (!user) {
    const error = new Error('Usuário não encontrado.');
    error.status = 404;
    throw error;
  }

  const profile = user.toJSON();
  profile.isOwner = currentUserId ? Number(currentUserId) === Number(profile.id) : false;

  return profile;
}

async function updateUserProfile(userId, { fullName, bio }, file) {
  const user = await User.findByPk(userId);

  if (!user) {
    const error = new Error('Usuário não encontrado.');
    error.status = 404;
    throw error;
  }

  const updates = {};
  if (fullName !== undefined) updates.fullName = fullName;
  if (bio !== undefined) updates.bio = bio;

  // Se uma nova foto foi enviada via Multer
  if (file) {
    const oldPicture = user.profilePicture;
    updates.profilePicture = file.filename;

    // Remove a foto antiga do disco, se não for a imagem padrão
    if (oldPicture && oldPicture !== 'default-profile.png') {
      const fs = require('fs');
      const path = require('path');
      const oldPath = path.join(__dirname, '../../public/uploads/profiles', oldPicture);
      fs.unlink(oldPath, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error('Erro ao remover foto de perfil antiga:', err.message);
        }
      });
    }
  }

  await user.update(updates);

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    bio: user.bio,
    profilePicture: user.profilePicture,
    followersCount: user.followersCount,
    followingCount: user.followingCount,
    photosCount: user.photosCount,
    isAdmin: user.isAdmin,
  };
}

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getPublicProfile,
  updateUserProfile,
};

