/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

//  * Copyright 2025 The Backstage Authors
//  *
//  * Licensed under the Apache License, Version 2.0 (the "License");
//  * you may not use this file except in compliance with the License.
//  * You may obtain a copy of the License at
//  *
//  *     http://www.apache.org/licenses/LICENSE-2.0
//  *
//  * Unless required by applicable law or agreed to in writing, software
//  * distributed under the License is distributed on an "AS IS" BASIS,
//  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  * See the License for the specific language governing permissions and
//  * limitations under the License.
//  */
// import { GoogleGenerativeAI } from '@google/generative-ai';
// import {
//     catalogApiRef,
// } from '@backstage/plugin-catalog-react';
// import { useApi } from '@backstage/core-plugin-api';

// const useGeminiAI = () => {

//     const catalogApi = useApi(catalogApiRef);

//     const GET_ALL_BACKSTAGE_ENTITIES: string = 'getBackstageEntities';

//     const getBackstageEntitiesFunctionDeclaration = {
//         name: GET_ALL_BACKSTAGE_ENTITIES,
//         description: "Retrieves all the entities stored in the entity catalog."
//     }

//     const genAI = new GoogleGenerativeAI('');
//     const model = genAI.getGenerativeModel({
//         model: 'gemini-1.5-pro',
//         tools: [
//             {
//                 functionDeclarations: [getBackstageEntitiesFunctionDeclaration]
//             },
//         ],
//     });

//     const functions = {
//         [GET_ALL_BACKSTAGE_ENTITIES]: () => {
//             return catalogApi.getEntities();
//         }
//     }

//     const startChat = async () => {
//         const chat = model.startChat();
//         const prompt = "Please show me the first 5 entities in Backstage catalog.";

//         // Send the message to the model.
//         const result = await chat.sendMessage(prompt);

//         // For simplicity, this uses the first function call found.
//         const call = result?.response?.functionCalls()?.[0];

//         if (call) {
//             // Call the executable function named in the function call
//             // with the arguments specified in the function call and
//             // let it call the hypothetical API.
//             const apiResponse = await functions[call.name]();

//             // Send the API response back to the model so it can generate
//             // a text response that can be displayed to the user.
//             const result2 = await chat.sendMessageStream([{
//                 functionResponse: {
//                     name: GET_ALL_BACKSTAGE_ENTITIES,
//                     response: apiResponse
//                 }
//             }]);

//             // Log the text response.
//             for await (const chunk of result2.stream) {
//                 // eslint-disable-next-line no-console
//                 console.log(chunk.text());
//             }
//         }
//     }
//     startChat();

// }

// export default useGeminiAI;
