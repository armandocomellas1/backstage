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
import {
  createPlugin,
  createRoutableExtension,
  createRouteRef,
} from '@backstage/core-plugin-api';

// Define the route reference
export const chatbotRouteRef = createRouteRef({
  id: 'chatbot',
});

export const chatbotPlugin = createPlugin({
  id: 'chatbot',
  routes: {
    root: chatbotRouteRef, // ✅ Correct way to reference a route
  },
});

export const ChatbotPage = chatbotPlugin.provide(
  createRoutableExtension({
    component: () => import('./components/Chatbot').then(m => m.default),
    mountPoint: chatbotRouteRef, // ✅ Correct way to mount the component
  }),
);
