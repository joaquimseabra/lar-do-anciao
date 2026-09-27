<script setup>
import HeaderBar from '@/components/layout/HeaderBar.vue'
import BottomNav from '@/components/layout/BottomNav.vue'
</script>

<template>
  <div class="min-h-screen bg-slate-200/60 flex justify-center selection:bg-blue-500 selection:text-white">
    <!-- Container Central Mobile-First (conforme especificação Figma: max-w-md mx-auto min-h-screen bg-slate-50) -->
    <div class="w-full max-w-md min-h-screen bg-slate-50 flex flex-col relative shadow-xl border-x border-slate-200/80">
      <!-- Header Superior Institucional -->
      <HeaderBar />

      <!-- Conteúdo Principal da Rota com espaçamento seguro para Bottom Nav -->
      <main class="flex-1 pb-24 overflow-y-auto">
        <router-view v-slot="{ Component }">
          <transition 
            name="fade-slide" 
            mode="out-in"
          >
            <component :is="Component" />
          </transition>
        </router-view>
      </main>

      <!-- Barra de Navegação Inferior de 5 Abas Fixas -->
      <BottomNav />
    </div>
  </div>
</template>

<style>
/* Transição suave entre abas do aplicativo */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
