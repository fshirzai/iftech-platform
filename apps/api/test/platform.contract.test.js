import test from 'node:test';
import assert from 'node:assert/strict';
import {definitions} from '../src/modules/platform.js';

test('all core business modules are registered',()=>{
 for(const name of ['products','services','portfolio','requests','proposals','projects','tasks','milestones','changes','invoices','tickets','messages','notifications'])
  assert.ok(definitions[name]?.Model,name);
});
test('invoice validation blocks negative amounts and unknown fields',()=>{
 const schema=definitions.invoices.schema;
 const fields={client:'507f1f77bcf86cd799439011',description:'Client software delivery',amount:-100};
 assert.equal(schema.safeParse(fields).success,false);
 assert.equal(schema.safeParse({...fields,amount:100,unauthorizedRole:'ADMIN'}).success,false);
});
test('proposals require a request and nonnegative price',()=>{
 assert.equal(definitions.proposals.schema.safeParse({request:'507f1f77bcf86cd799439011',title:'Project proposal',scope:'Detailed agreed scope',price:1000}).success,true);
});
