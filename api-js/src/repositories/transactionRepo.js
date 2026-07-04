const supabase = require('../utils/supabaseClient');

class TransactionRepository {
  async createTransaction({ userId, fromAccountId, toAccountId, amount, type }) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{ 
        user_id: userId, 
        from_account_id: fromAccountId, 
        to_account_id: toAccountId, 
        amount, 
        type 
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async getTransactionsByUser(userId) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }
}

module.exports = new TransactionRepository();
