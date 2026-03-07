import { BastionController } from '../../bastion/bastion-controller';

async function run() {
    const bastion = new BastionController({ sandbox: { enabled: true } });
    await bastion.initialize('test-pass');
    const result = await bastion.validateMutation('test', 'const x = 1; x + 1;');
    console.log(JSON.stringify(result, null, 2));
    await bastion.shutdown();
}

run().catch(console.error);
