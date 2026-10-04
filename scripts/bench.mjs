import autocannon from 'autocannon';

const base = 'http://127.0.0.1:11001/api/v1';
const token = '';

const ids = [
  226, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225,
  227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241,
  242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256,
  257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271,
  272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 287,
  288, 289, 290, 291, 292, 293, 294, 295, 296, 297, 299, 300, 301, 302, 303,
  304, 305, 306, 307, 308, 309, 310, 311, 286, 298,
];
const urls = ids.map((id) => `${base}/products/${id}`);

async function warm() {
  for (const u of urls) await fetch(u);
}

async function run(label) {
  const result = await autocannon({
    url: urls,
    connections: 10,
    duration: 10,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log(`=== ${label} ===`);
  console.log(`QPS: ${result.requests.average.toFixed(0)}`);
  console.log(`avg: ${result.latency.average.toFixed(2)}ms`);
  console.log(`p99: ${result.latency.p99.toFixed(2)}ms`);
}

const mode = process.argv[2];

if (mode === 'warm') await warm();
await run(mode === 'warm' ? '缓存命中' : '未命中+回填');

/**
 * 
cold
QPS: 10161
avg: 0.40ms
p99: 5.00ms

QPS: 11703
avg: 0.28ms
p99: 4.00ms

warm
QPS: 11402
avg: 0.29ms
p99: 4.00ms

QPS: 13757
avg: 0.14ms
p99: 2.00ms
 */
