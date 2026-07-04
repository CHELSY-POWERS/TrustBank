const supabase = require('../utils/supabaseClient');
const { UnauthorizedError, ConflictError, ValidationError } = require('../errors/CustomErrors');

class AuthService {
  async register(email, password) {
    if (!email || !password) throw new ValidationError('Email and password are required');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        throw new ConflictError('Email already used');
      }
      throw new ValidationError(error.message);
    }
    return data;
  }

  async login(email, password) {
    if (!email || !password) throw new ValidationError('Email and password are required');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedError('Invalid credentials');
    }
    return data;
  }
}

module.exports = new AuthService();
