/**
 * AutonomousSalesForce — Qantum Module
 * @module AutonomousSalesForce
 * @path src/departments/reality/AutonomousSalesForce.ts
 * @auto-documented BrutalDocEngine v2.1
 */

// src/reality/AutonomousSalesForce.ts

import { OllamaManager } from '../../ai/OllamaManager';
import { ValueBombGenerator } from '../finance/ValueBombGenerator';

interface ProspectProfile {
    name: string;
    company: string;
    role: string;
    painPoint: string;
}

export class AutonomousSalesForce {
    private llm: OllamaManager;
    private valueBombGen: ValueBombGenerator;

    constructor(llm: OllamaManager, valueBombGen: ValueBombGenerator) {
        this.llm = llm;
        this.valueBombGen = valueBombGen;
    }

    // Complexity: O(N)
    async craftOutreachMessage(prospect: ProspectProfile, valueBombContent: string): Promise<string> {
        console.log(`[AutonomousSalesForce] Crafting pitch for ${prospect.name}...`);

        const prompt = `
            Ти си Elite B2B Sales Copywriter (QAntum OMEGA).
            Задача: Напиши студено LinkedIn съобщение (или имейл).

            До: ${prospect.name} (${prospect.role} в ${prospect.company}).
            Pain Point: ${prospect.painPoint}
            Offer: Вече сме генерирали безплатно решение за тях (Value Bomb).

            // Complexity: O(1)
            Metrics (МАНТРА):
            - 860,503 реда суверенен Rust / TS код.
            - 100% локален AI (без облачни зависимости).
            - Директно съответствие с NIS2 и GDPR.

            Съдържание на Value Bomb (за контекст):
            "${valueBombContent.substring(0, 300)}..." (извадка)

            Структура на съобщението:
            1. Hook: Концентрация върху болката на клиента (Pain Point).
            2. Authority: Спомени за 860,503 реда суверенен код, който работи за тях.
            3. Value: "Забелязахме проблем X, затова моят AI (QAntum) генерира решение Y безплатно."
            4. The Cold Logic: "Ние не продаваме софтуер, ние елиминираме цифровата ентропия."
            5. Soft Close: "Ако ти харесва, мога да правя това всеки месец. Искаш ли да видиш пълния файл?"

            Тон: "Steel" (Стомана) – професионален, директен, задвижван от данни. Без емотикони. Без фалшив ентусиазъм.

            СТРИКТНИ ПРАВИЛА:
            1. Използвай КНИЖОВЕН БЪЛГАРСКИ ЕЗИК.
            2. ЗАБРАНЕНО: "виднеш", "замогва", "текст на болгарски", "currently".
               - Моментално елиминирай измислени или неточно използвани думи.
               - "замогва" е ГРЕШНО (означава "забогатява"). Използвай: "затруднява", "натоварва", "възпрепятства".
               - "Искате ли да видите пълния файл?" е правилната форма.
            3. БЕЗ МЕТА-КОМЕНТАРИ: Не започвай с "Ето предложение" или "Надявам се...".
               Върни ДИРЕКТНО съобщението, което ще бъде изпратено.
            4. СТРУКТУРА:
               - Тема: [Привлекателно заглавие]
               - Съобщение: [Текст]

            Напиши съобщението на Български език:
        `;

        try {
            const message = await this.llm.ask(prompt);
            return message;
        } catch (error) {
            console.error("Error creating outreach message:", error);
            return `Здравей ${prospect.name}, виж това предложение за ${prospect.company}.`;
        }
    }
}
