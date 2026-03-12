import { _ as __nuxt_component_0 } from './nuxt-link-BtQrV7j8.mjs';
import { a as useAuth, b as useRouter, _ as __nuxt_component_1$1 } from './server.mjs';
import { defineComponent, computed, mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot, ssrInterpolate } from 'vue/server-renderer';
import { u as useUserStore } from './user-Tw6xDzm0.mjs';
import '../_/nitro.mjs';
import '@supabase/supabase-js';
import '@prisma/client';
import '@prisma/adapter-pg';
import 'pg';
import '@google-cloud/dialogflow';
import 'uuid';
import 'nodemailer';
import 'twilio';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:url';
import 'ipx';
import 'node:fs';
import 'node:path';
import 'pinia';
import 'vue-router';
import 'tailwindcss/colors';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import './asyncData-gvl6Vp1x.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuth();
    computed(() => auth?.user?.value || null);
    useUserStore();
    useRouter();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_ClientOnly = __nuxt_component_1$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900" }, _attrs))}><header class="sticky top-0 z-50 backdrop-blur-md bg-gray-900/80 border-b border-white/10"><div class="container mx-auto px-4 py-4"><nav class="flex items-center justify-between">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-pink-300 transition"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` CharaTech `);
          } else {
            return [
              createTextVNode(" CharaTech ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
      _push(`</nav></div></header><main class="flex-1">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main><footer class="mt-auto py-8 border-t border-white/10 bg-gray-900/50 backdrop-blur-sm"><div class="container mx-auto px-4"><div class="flex flex-col md:flex-row justify-between items-center gap-4"><p class="text-white/60 text-sm"> © ${ssrInterpolate((/* @__PURE__ */ new Date()).getFullYear())} CharaTech. All rights reserved. </p><div class="flex gap-6 text-sm"><a href="#" class="text-white/60 hover:text-white transition">Privacy Policy</a><a href="#" class="text-white/60 hover:text-white transition">Terms of Service</a><a href="#" class="text-white/60 hover:text-white transition">Contact</a></div></div></div></footer></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=default-BjijlhHL.mjs.map
