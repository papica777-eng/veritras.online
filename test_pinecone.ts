import { Pinecone } from '@pinecone-database/pinecone';
import { config } from 'dotenv';
config();

async function test() {
    const client = new Pinecone();
    const index = client.index('qantum-empire');
    const ns = index.namespace('empire');
    try {
        const listRes = await ns.listPaginated({ limit: 10 });
        console.log('List count:', listRes.vectors?.length);
        if (listRes.vectors?.length) {
            const ids = listRes.vectors.map(v => v.id);
            console.log('IDs length:', ids.length);
            console.log('First vector id:', ids[0]);
            if (ids.length > 0) {
                const fetchRes = await ns.fetch(ids);
                console.log('Fetch success', Object.keys(fetchRes.records).length);
            }
        } else {
            console.log("No vectors returned. Try with prefix?");
            const listRes2 = await ns.listPaginated({ prefix: 'c:', limit: 10 });
            console.log('List count with prefix:', listRes2.vectors?.length);
            if (listRes2.vectors?.length) {
                console.log(listRes2.vectors.map(v => v.id));
            }
        }
    } catch (err) {
        console.error(err);
    }
}
test();
