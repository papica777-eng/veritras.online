"use strict";
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.interfaceTestEngine = interfaceTestEngine;
const typescript_1 = require("typescript");
const assert_1 = require("assert");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function getTypeScriptFilesFromDirs(dirs) {
    let files = [];
    dirs.forEach(dir => {
        const absoluteDir = path.resolve(dir);
        const dirFiles = fs
            .readdirSync(absoluteDir)
            .filter(file => file.endsWith('.ts'))
            .map(file => path.join(absoluteDir, file));
        files = files.concat(dirFiles);
    });
    return files;
}
function getInterfaceProperties(interfaceType, checker) {
    const properties = checker.getPropertiesOfType(interfaceType);
    return properties.map(property => {
        const propertyType = checker.getTypeOfSymbolAtLocation(property, property.valueDeclaration);
        const propertyName = property.getName();
        const propTypeName = checker.typeToString(propertyType);
        const isOptional = property.valueDeclaration.questionToken !== undefined;
        return { name: propertyName, type: propTypeName, optional: isOptional };
    });
}
function isPropertyMatch(sdkProperties, contractProperties) {
    for (const contractProperty of contractProperties) {
        const sdkProperty = sdkProperties.find(property => property.name === contractProperty.name);
        if (!sdkProperty) {
            return false;
        }
        if (contractProperty.optional !== sdkProperty.optional) {
            return false;
        }
        if (sdkProperty.type !== contractProperty.type) {
            return false;
        }
    }
    return true;
}
function getInterfacesFromSourceFile(sourceFile, checker) {
    const interfaces = {};
    const visit = (node) => {
        if ((0, typescript_1.isInterfaceDeclaration)(node) && (0, typescript_1.isIdentifier)(node.name)) {
            const interfaceName = node.name.text;
            const symbol = checker.getSymbolAtLocation(node.name);
            if (symbol) {
                const interfaceType = checker.getDeclaredTypeOfSymbol(symbol);
                const properties = getInterfaceProperties(interfaceType, checker);
                interfaces[interfaceName] = { name: interfaceName, properties };
            }
        }
        node.forEachChild(visit);
    };
    visit(sourceFile);
    return interfaces;
}
function interfaceTestEngine(sdkName, sdkInterfaceDirs, contractInterfaceFiles) {
    const fileNames = contractInterfaceFiles.concat(getTypeScriptFilesFromDirs(sdkInterfaceDirs));
    console.info(`${sdkName}: file names in the program: ${fileNames}`);
    const program = (0, typescript_1.createProgram)(fileNames, {
        target: typescript_1.ScriptTarget.ES2015,
        module: typescript_1.ModuleKind.ESNext,
    });
    const checker = program.getTypeChecker();
    const sourceFiles = program
        .getSourceFiles()
        .filter(sf => !sf.isDeclarationFile);
    let sdkInterfaces = {};
    let contractInterfaces = {};
    sourceFiles.forEach(sourceFile => {
        const fileName = sourceFile.fileName;
        const absoluteFileName = path.resolve(fileName);
        if (sdkInterfaceDirs.some(dir => absoluteFileName.startsWith(dir))) {
            const thisSDKInterfaces = getInterfacesFromSourceFile(sourceFile, checker);
            sdkInterfaces = {
                ...sdkInterfaces,
                ...thisSDKInterfaces,
            };
        }
        else if (contractInterfaceFiles.some(file => absoluteFileName.startsWith(file)) &&
            absoluteFileName.endsWith('interface_contract.ts')) {
            const thisContractInterfaces = getInterfacesFromSourceFile(sourceFile, checker);
            contractInterfaces = {
                ...contractInterfaces,
                ...thisContractInterfaces,
            };
        }
    });
    Object.keys(contractInterfaces).forEach(interfaceName => {
        console.info(`${sdkName}: checking ${interfaceName}`);
        const contractInterface = contractInterfaces[interfaceName];
        const sdkInterface = sdkInterfaces[interfaceName];
        (0, assert_1.strict)(sdkInterface, `${sdkName}: could not find ${interfaceName} interfaces`);
        (0, assert_1.strict)(isPropertyMatch(sdkInterface.properties, contractInterface.properties), `${sdkName}: interface ${JSON.stringify(sdkInterface)} does not match the contract ${JSON.stringify(contractInterface)}`);
    });
}
