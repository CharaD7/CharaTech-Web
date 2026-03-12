import { _ as __nuxt_component_0 } from './nuxt-link-BtQrV7j8.mjs';
import { defineComponent, resolveDirective, mergeProps, withCtx, createVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrGetDirectiveProps, ssrRenderList, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
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
import './server.mjs';
import 'pinia';
import 'vue-router';
import 'tailwindcss/colors';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const features = [
      {
        icon: "🎯",
        title: "Industry-Specific",
        description: "Tailored questions for your industry"
      },
      {
        icon: "🤖",
        title: "AI-Powered",
        description: "Smart assistance via Dialogflow"
      },
      {
        icon: "⚡",
        title: "Fast & Easy",
        description: "Submit requirements in minutes"
      }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _directive_motion = resolveDirective("motion");
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "container mx-auto px-4 py-20",
        initial: { opacity: 0 },
        enter: { opacity: 1, transition: { duration: 800 } }
      }, _attrs, ssrGetDirectiveProps(_ctx, _directive_motion)))}><div class="text-center mb-12"><h1 class="text-6xl font-bold text-white mb-6"> Build Your Dream Software </h1><p class="text-xl text-white/80 max-w-2xl mx-auto"> Tell us what you need, and we&#39;ll bring your vision to life. Our intelligent platform makes it easy to specify your requirements. </p></div><div class="max-w-4xl mx-auto grid md:grid-cols-3 gap-6 mb-12"><!--[-->`);
      ssrRenderList(features, (feature, i) => {
        _push(`<div${ssrRenderAttrs(mergeProps({
          key: i,
          class: "glass-morphism p-6 rounded-xl text-center",
          initial: { opacity: 0, y: 20 },
          enter: { opacity: 1, y: 0, transition: { delay: i * 100, duration: 500 } }
        }, ssrGetDirectiveProps(_ctx, _directive_motion)))}><div class="text-4xl mb-4">${ssrInterpolate(feature.icon)}</div><h3 class="text-white font-semibold mb-2">${ssrInterpolate(feature.title)}</h3><p class="text-white/70 text-sm">${ssrInterpolate(feature.description)}</p></div>`);
      });
      _push(`<!--]--></div><div class="text-center">`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/register" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-lg rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"${_scopeId}><span class="text-white"${_scopeId}>Get Started Now</span></button>`);
          } else {
            return [
              createVNode("button", { class: "px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-lg rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105" }, [
                createVNode("span", { class: "text-white" }, "Get Started Now")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<p class="mt-4 text-white/60"> Already have an account? `);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/login",
        class: "text-purple-300 hover:text-purple-200"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Login here `);
          } else {
            return [
              createTextVNode(" Login here ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</p></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-D73a1laU.mjs.map
