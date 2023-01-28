import * as bcrypt from 'bcrypt';


// TODO generate proper salt
export const hashPassword = async entity => {
  const res = await bcrypt.hash(entity, 10);
  return res;
};

export const verifyPassword = async function(entity, entity_hash): Promise<boolean> {
  return await bcrypt.compare(entity, entity_hash);
};

export const decodeBase64 = token => {
  return Buffer.from(token, 'base64').toString();
};

export const generateHashSecret = client_secret => {
  return Buffer.from(client_secret).toString('base64');
};
