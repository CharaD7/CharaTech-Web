import { _ as __nuxt_component_0 } from './nuxt-link-BtQrV7j8.mjs';
import { a as useAuth, b as useRouter, _ as __nuxt_component_1$1 } from './server.mjs';
import { defineComponent, mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
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
  __name: "admin",
  __ssrInlineRender: true,
  setup(__props) {
    useAuth();
    useUserStore();
    useRouter();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_ClientOnly = __nuxt_component_1$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900" }, _attrs))}><header class="sticky top-0 z-50 backdrop-blur-md bg-gray-900/90 border-b border-red-500/30 shadow-lg"><div class="container mx-auto px-4 py-4"><nav class="flex items-center justify-between"><div class="flex items-center gap-4">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin",
        class: "text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent hover:from-red-300 hover:to-orange-300 transition"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` ⚡ CharaTech Admin `);
          } else {
            return [
              createTextVNode(" ⚡ CharaTech Admin ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<span class="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-bold border border-red-400/30"> ADMIN PANEL </span></div>`);
      _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
      _push(`</nav></div></header><main class="flex-1">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main><footer class="mt-auto py-6 border-t border-white/10 bg-gray-900/50 backdrop-blur-sm"><div class="container mx-auto px-4"><div class="flex flex-col md:flex-row justify-between items-center gap-4"><p class="text-white/60 text-sm"><span class="text-red-400 font-semibold">Admin Panel</span> | © ${ssrInterpolate((/* @__PURE__ */ new Date()).getFullYear())} CharaTech </p><div class="flex gap-6 text-sm"><span class="text-white/40">Version 1.0.0</span></div></div></div></footer></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/admin.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=admin-Ch7nf50o.mjs.map
