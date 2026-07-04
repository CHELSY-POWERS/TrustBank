const supabase = require('../utils/supabaseClient');
const { NotFoundError } = require('../errors/CustomErrors');

class AccountRepository {
  async createAccount(userId, accountType = 'checking', initialBalance = 0) {
    const { data, error } = await supabase
      .from('accounts')
      .insert([{ user_id: userId, account_type: accountType, balance: initialBalance }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getAccountsByUserId(userId) {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId);

    if (error) throw new Error(error.message);
    return data;
  }

  async getAccountById(accountId) {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (error || !data) throw new NotFoundError('Account not found');
    return data;
  }

  // Uses RPC to avoid race conditions natively if implemented in SQL,
  // but for simplicity without RPC, we'll use optimistic updates or rely on PostgreSQL transactions.
  // Supabase JS doesn't easily support multi-statement transactions without RPC.
  // We will handle atomic operations via a Supabase Postgres function `transfer_funds` later, 
  // or just use basic updates for the prototype constraints.
  async updateBalance(accountId, newBalance) {
    const { data, error } = await supabase
      .from('accounts')
      .update({ balance: newBalance })
      .eq('id', accountId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}

module.exports = new AccountRepository();
