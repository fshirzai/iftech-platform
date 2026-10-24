import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDatabase } from '../src/db/connect.js';
import { User } from '../src/modules/platform.js';
const [email,name,password]=process.argv.slice(2);
if(!email||!name||!password||password.length<12){console.error('Usage: npm run create-admin -- email@example.com "Admin Name" "12+CharacterPassword"');process.exit(1);}
try{
 await connectDatabase();
 const existing=await User.findOne({email:email.toLowerCase()});
 if(existing)throw new Error('Account already exists. Use admin tools to update users.');
 await User.create({email,name,passwordHash:await bcrypt.hash(password,12),role:'ADMIN',active:true,verified:true});
 console.log('Initial administrator created');process.exit(0);
}catch(err){console.error(err.message);process.exit(1);}
