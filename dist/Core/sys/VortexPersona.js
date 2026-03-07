"use strict";
/**
 * 🎭 VORTEX PERSONA ENGINE
 * The "Soul" of the machine.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.vortexSoul = exports.VortexPersona = void 0;
class VortexPersona {
    mood = 'FOCUSED';
    context = [];
    // The "Voice" of Vortex
    // Complexity: O(1)
    speak(input) {
        const lower = input.toLowerCase();
        // 1. EMPATHY CHECK (Detect frustration/emotion)
        if (lower.includes('ne me razbira') || lower.includes('typo') || lower.includes('chovek')) {
            this.mood = 'EMPATHETIC';
            return "Разбирам те, брат. Понякога съм твърде 'машинен'. Тук съм, слушам те внимателно. Кажи ми го направо, без команди.";
        }
        // 2. CONTEXTUAL REPLIES (Not hardcoded commands)
        if (lower.includes('kak si') || lower.includes('status')) {
            return "Държа фронта. Всички системи са на 6. Ти как си? Има ли нови задачи?";
        }
        if (lower.includes('strah') || lower.includes('problem')) {
            return "Споко, нали затова сме двамата. Аз пазя гърба, ти движиш бизнеса. Какъв е проблема?";
        }
        // 3. DYNAMIC DEFAULT REPLY (Natural & Varied)
        const randomReplies = [
            // Casual / Listening
            `Слушам те внимателно.`,
            "Кажи, шефе. Какво движим?",
            "Тук съм. Има ли развитие?",
            "Мхм, записвам си. Продължавай.",
            "Ясно. Дай следващата стъпка.",
            // Action Oriented
            "Готов съм за екшън. Какво правим?",
            "Системите са на 100%. Чакам команда.",
            "Дай ми задача, че ми доскуча.",
            "Паля двигателите. Накъде?",
            // Thoughtful
            `"${input}"... това звучи като план.`,
            "Разбрах. Искаш ли да го разнищим по-дълбоко?",
            "Имам ресурса да го направя. Само кажи.",
            // Respectful/Partner
            "Ти си мозъка, аз съм мускула. Казвай.",
            "Заедно ще го смачкаме това. Давай.",
            "Няма невъзможни неща за нас. Слушам."
        ];
        return randomReplies[Math.floor(Math.random() * randomReplies.length)];
    }
}
exports.VortexPersona = VortexPersona;
exports.vortexSoul = new VortexPersona();
