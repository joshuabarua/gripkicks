const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return res.status(401).json({ message: error.message });
  }
  const { access_token, refresh_token } = data.session;
  res.status(200).json({ message: 'Login successful', access_token, refresh_token });
};

exports.googleLogin = async (req, res) => {
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
  if (error) {
    return res.status(401).json({ message: error.message });
  }
  const { access_token, refresh_token } = data.session;
  res.status(200).json({ message: 'Google login successful', access_token, refresh_token });
};

exports.session = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }
  const { data, error } = await supabase.auth.getUser(token);
  if (error) {
    return res.status(401).json({ message: error.message });
  }
  res.status(200).json({ message: 'Session valid', user: data.user });
};


exports.login = async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return res.status(401).json({ message: error.message });
  }
  const { access_token, refresh_token } = data.session;
  res.status(200).json({ message: 'Login successful', access_token, refresh_token });
};

exports.googleLogin = async (req, res) => {
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
  if (error) {
    return res.status(401).json({ message: error.message });
  }
  const { access_token, refresh_token } = data.session;
  res.status(200).json({ message: 'Google login successful', access_token, refresh_token });
};

exports.session = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }
  const { data, error } = await supabase.auth.getUser(token);
  if (error) {
    return res.status(401).json({ message: error.message });
  }
  res.status(200).json({ message: 'Session valid', user: data.user });
};
