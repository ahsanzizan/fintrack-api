import * as bcrypt from 'bcrypt';

export async function hashData(data: string) {
  const saltOrRounds = Number(process.env.SALT_OR_ROUNDS as string);
  const hashedData = await bcrypt.hash(data, saltOrRounds);

  return hashedData;
}

export async function compareData(hashedData: string, inputData: string) {
  const comparation = await bcrypt.compare(inputData, hashedData);
  return comparation;
}
