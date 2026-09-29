import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const users = [
  { phone: '13800138000', nickname: 'George' },
  { phone: '18820260000', nickname: 'Bob' },
];

async function main() {
  // TODO 1: 幂等清库——upsert 数据 or deleteMany？想想为什么 seed 要可重复执行
  await prisma.cartItem.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.sku.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  // TODO 2: 造 2 个用户（手机号自定）
  const createUserTask = [];
  const createInventoryTask = [];
  for (const user of users) {
    createUserTask.push(prisma.user.create({ data: user }));
  }

  const iphone = await prisma.product.create({
    data: {
      name: 'iPhone 17',
      description: '旗舰机型',
      status: 'ON_SALE',
      skus: {
        // 利用关系级联创建，一次请求写入商品+SKU
        create: [
          { spec: '256G 黑色', price: 599900 },
          { spec: '512G 红色', price: 699900 },
        ],
      },
    },
    include: { skus: true }, // 回读创建出的 SKU，下一步要用
  });
  for (const sku of iphone.skus) {
    createInventoryTask.push(
      prisma.inventory.create({
        data: { skuId: sku.id, available: 100, locked: 0 },
      }),
    );
  }
  await Promise.all([...createUserTask, ...createInventoryTask]);
  console.log('seed done:', {
    users: users.map((user) => user.nickname),
    iphone: iphone.id,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
