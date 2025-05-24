// src/utils/input.ts - User input utilities
import prompts from 'prompts';

/**
 * Get user input with a prompt
 */
export async function getUserInput(message: string): Promise<string> {
    const response = await prompts({
        type: 'text',
        name: 'value',
        message: message
    });

    return response.value;
}