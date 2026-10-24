import mongoose from 'mongoose';
import { z } from 'zod';

const { Schema } = mongoose;
const obj = (ref, required = false) => ({ type: Schema.Types.ObjectId, ref, required });
const text = (required = false) => ({ type: String, trim: true, required });
const base = { timestamps: true, strict: true, versionKey: false };
const create = (name, fields, opts = {}) => mongoose.models[name] || mongoose.model(name, new Schema(fields, { ...base, ...opts }));

export const User = create('User', {
  name: text(true), email: { type: String, required: true, lowercase: true, trim: true, unique: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['CLIENT','SALES','DEVELOPER','PROJECT_MANAGER','FINANCE','SUPPORT','CONTENT_MANAGER','ADMIN'], default: 'CLIENT' },
  active: { type: Boolean, default: true }, verified: { type: Boolean, default: false },
  verificationHash: { type: String, select: false }, verificationExpires: Date,
  resetHash: { type: String, select: false }, resetExpires: Date,
});
export const Product = create('Product', {
  title: text(true), slug: { type: String, required: true, unique: true, lowercase: true }, category: String,
  description: String, features: [String], images: [String],
  demoUrl: String, demoInstructions: String, startingPrice: Number, currency: { type: String, default: 'USD' },
  published: { type: Boolean, default: false },
});
export const Service = create('Service', { title: text(true), slug: { type: String, required: true, unique: true }, description: String, published: { type: Boolean, default: false } });
export const Portfolio = create('Portfolio', { title: text(true), description: String, imageUrl: String, clientName: String, published: { type: Boolean, default: false } });
export const Article = create('Article', { title: text(true), slug: { type: String, required: true, unique: true }, summary: String, content: String, published: { type: Boolean, default: false } });
export const Request = create('CustomerRequest', {
  client: obj('User', true), title: text(true), description: text(true), category: { type: String, enum: ['CUSTOM','PRODUCT','CONSULTATION'], default: 'CUSTOM' },
  product: obj('Product'), budget: Number, currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['NEW','REVIEWING','PROPOSAL_SENT','APPROVED','REJECTED','CLOSED'], default: 'NEW' },
  assignedTo: obj('User'),
});
export const Proposal = create('Proposal', {
  request: obj('CustomerRequest', true), client: obj('User', true), title: text(true), scope: text(true),
  price: { type: Number, required: true, min: 0 }, currency: { type: String, default: 'USD' },
  estimatedDays: Number, version: { type: Number, default: 1 },
  status: { type: String, enum: ['DRAFT','SENT','ACCEPTED','REJECTED','REVISION_REQUESTED'], default: 'DRAFT' },
  feedback: String, sentAt: Date, acceptedAt: Date,
});
Proposal.schema.index({ request: 1, version: 1 }, { unique: true });
Project.schema.index({ proposal: 1 }, { unique: true, sparse: true });
export const Project = create('Project', {
  client: obj('User', true), proposal: obj('Proposal'), title: text(true), description: String,
  manager: obj('User'), members: [obj('User')],
  status: { type: String, enum: ['PLANNING','IN_PROGRESS','TESTING','CLIENT_REVIEW','DELIVERED','CLOSED'], default: 'PLANNING' },
  dueDate: Date, progress: { type: Number, default: 0, min: 0, max: 100 },
});
export const Task = create('Task', {
  project: obj('Project', true), title: text(true), description: String, assignee: obj('User'),
  status: { type: String, enum: ['TODO','IN_PROGRESS','REVIEW','DONE'], default: 'TODO' }, dueDate: Date,
});
export const Milestone = create('Milestone', {
  project: obj('Project', true), title: text(true), description: String, dueDate: Date,
  status: { type: String, enum: ['PENDING','IN_PROGRESS','COMPLETED'], default: 'PENDING' },
});
export const ChangeRequest = create('ChangeRequest', {
  project: obj('Project', true), client: obj('User', true), title: text(true), description: text(true),
  impact: String, priceImpact: Number, daysImpact: Number,
  status: { type: String, enum: ['REQUESTED','ASSESSED','APPROVED','REJECTED','IMPLEMENTED'], default: 'REQUESTED' },
});
export const Invoice = create('Invoice', {
  client: obj('User', true), project: obj('Project'), proposal: obj('Proposal'),
  number: { type: String, unique: true, required: true }, description: text(true),
  amount: { type: Number, required: true, min: 0.01 }, currency: { type: String, default: 'AFN' },
  status: { type: String, enum: ['DRAFT','ISSUED','PAID','VOID'], default: 'DRAFT' }, dueDate: Date,
  paidAt: Date,
});
export const Payment = create('Payment', {
  client: obj('User', true), invoice: obj('Invoice', true), provider: { type: String, default: 'HESABPAY' },
  amount: Number, currency: String, status: { type: String, enum: ['PENDING','SUCCEEDED','FAILED'], default: 'PENDING' },
  checkoutUrl: String, providerReference: String, verificationData: Schema.Types.Mixed,
});
Payment.schema.index({ providerReference: 1 }, { unique: true, sparse: true });
export const Ticket = create('Ticket', {
  client: obj('User', true), project: obj('Project'), title: text(true), description: text(true),
  assignee: obj('User'), status: { type: String, enum: ['OPEN','IN_PROGRESS','WAITING_CLIENT','RESOLVED','CLOSED'], default: 'OPEN' },
});
export const Message = create('Message', {
  sender: obj('User', true), recipient: obj('User'), project: obj('Project'), ticket: obj('Ticket'), body: text(true),
});
export const Notification = create('Notification', { user: obj('User', true), title: text(true), body: String, read: { type: Boolean, default: false }, link: String });
export const Audit = create('Audit', { actor: obj('User'), action: String, targetType: String, targetId: Schema.Types.ObjectId, details: Schema.Types.Mixed }, { strict: 'throw' });

const id = z.string().regex(/^[a-f\d]{24}$/i);
const optionalId = id.optional();
const short = z.string().trim().min(2).max(180);
const long = z.string().trim().min(3).max(10000);
const money = z.number().finite().min(0);
const date = z.string().datetime().optional();
const bool = z.boolean();
const nonnegativeInt = z.number().int().min(0);
export const definitions = {
  products: { Model: Product, read: 'PUBLIC', write: ['ADMIN','CONTENT_MANAGER'], schema: z.object({ title: short, slug: z.string().regex(/^[a-z0-9-]+$/), category: z.string().max(80).optional(), description: long.optional(), features: z.array(z.string().max(100)).max(40).optional(), images: z.array(z.string().url()).max(12).optional(), demoUrl: z.string().url().optional(), demoInstructions: z.string().max(1200).optional(), startingPrice: money.optional(), currency: z.string().length(3).optional(), published: bool.optional() }).strict() },
  services: { Model: Service, read: 'PUBLIC', write: ['ADMIN','CONTENT_MANAGER'], schema: z.object({title:short,slug:z.string().regex(/^[a-z0-9-]+$/),description:long.optional(),published:bool.optional()}).strict() },
  portfolio: { Model: Portfolio, read: 'PUBLIC', write: ['ADMIN','CONTENT_MANAGER'], schema: z.object({title:short,description:long.optional(),imageUrl:z.string().url().optional(),clientName:z.string().max(100).optional(),published:bool.optional()}).strict() },
  articles: { Model: Article, read: 'PUBLIC', write: ['ADMIN','CONTENT_MANAGER'], schema: z.object({title:short,slug:z.string().regex(/^[a-z0-9-]+$/),summary:z.string().max(400).optional(),content:long.optional(),published:bool.optional()}).strict() },
  requests: { Model: Request, owner: 'client', write: ['CLIENT','SALES','ADMIN'], schema: z.object({ title:short,description:long,category:z.enum(['CUSTOM','PRODUCT','CONSULTATION']).optional(),product:optionalId,budget:money.optional(),currency:z.string().length(3).optional() }).strict() },
  proposals: { Model: Proposal, owner: 'client', write: ['SALES','ADMIN'], schema: z.object({request:id,title:short,scope:long,price:money,currency:z.string().length(3).optional(),estimatedDays:nonnegativeInt.optional()}).strict() },
  projects: { Model: Project, owner: 'client', write: ['ADMIN','PROJECT_MANAGER'], schema: z.object({client:id,title:short,description:long.optional(),manager:optionalId,members:z.array(id).optional(),dueDate:date}).strict() },
  tasks: { Model: Task, scoped: 'project', write: ['ADMIN','PROJECT_MANAGER','DEVELOPER'], schema: z.object({project:id,title:short,description:long.optional(),assignee:optionalId,dueDate:date}).strict() },
  milestones: { Model: Milestone, scoped: 'project', write: ['ADMIN','PROJECT_MANAGER'], schema: z.object({project:id,title:short,description:long.optional(),dueDate:date}).strict() },
  changes: { Model: ChangeRequest, scoped: 'project', write: ['CLIENT','ADMIN','PROJECT_MANAGER'], schema: z.object({project:id,title:short,description:long}).strict() },
  invoices: { Model: Invoice, owner: 'client', write: ['ADMIN','FINANCE'], schema: z.object({client:id,project:optionalId,proposal:optionalId,description:long,amount:z.number().positive(),currency:z.string().length(3).optional(),dueDate:date}).strict() },
  tickets: { Model: Ticket, owner: 'client', write: ['CLIENT','ADMIN','SUPPORT'], schema: z.object({title:short,description:long,project:optionalId}).strict() },
  messages: { Model: Message, write: ['CLIENT','SALES','DEVELOPER','PROJECT_MANAGER','ADMIN','SUPPORT'], schema: z.object({recipient:optionalId,project:optionalId,ticket:optionalId,body:long}).strict() },
  notifications: { Model: Notification, owner: 'user', write: [], schema: z.object({}).strict() },
};
export const STAFF = new Set(['SALES','DEVELOPER','PROJECT_MANAGER','FINANCE','SUPPORT','CONTENT_MANAGER','ADMIN']);
export const MANAGERS = new Set(['SALES','PROJECT_MANAGER','FINANCE','SUPPORT','CONTENT_MANAGER','ADMIN']);
export const isId = (value) => mongoose.isValidObjectId(value);
