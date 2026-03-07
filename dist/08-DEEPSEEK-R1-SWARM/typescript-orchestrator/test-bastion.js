"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bastion_controller_1 = require("../../bastion/bastion-controller");
async function run() {
    const bastion = new bastion_controller_1.BastionController({ sandbox: { enabled: true } });
    await bastion.initialize('test-pass');
    const result = await bastion.validateMutation('test', 'const x = 1; x + 1;');
    console.log(JSON.stringify(result, null, 2));
    await bastion.shutdown();
}
run().catch(console.error);
