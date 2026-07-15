<template>
  <div class="min-h-screen bg-surface" v-if="auth.user">
    <AppNavbar />
    <div class="bg-white border-b px-6 py-2 flex justify-between items-center text-sm text-gray-500">
      <span class="font-medium text-gray-700">{{ parche?.name }}</span>
      <div class="flex items-center gap-4">
        <span>👥 {{ parche?.members_count }} miembros</span>
        <button 
          v-if="isCreator" 
          @click="eliminarParche"
          class="text-xs text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full transition"
        >
          🗑️ Eliminar parche
        </button>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 py-6 space-y-6">

      <!-- Código invitación -->
      <div class="bg-brand-50 border border-brand-200 rounded-xl px-5 py-3 flex justify-between items-center">
        <span class="text-sm text-brand-700">Código de invitación</span>
        <div class="flex items-center gap-2">
          <strong class="text-brand-900 tracking-widest">{{ parche?.invite_code }}</strong>
          <button
            type="button"
            @click="copiarCodigo"
            class="p-1.5 rounded-lg hover:bg-brand-100 transition-colors"
            :title="copiado ? 'Copiado' : 'Copiar código'"
          >
            <svg v-if="!copiado" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Balance personal -->
      <div class="bg-white rounded-xl shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Mi balance</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="bg-green-50 rounded-lg p-3 text-center">
            <p class="text-xs text-gray-500 mb-1">Pagado</p>
            <p class="text-lg font-bold text-green-600">${{ formatMoneda(balance.pagado) }}</p>
          </div>
          <div class="bg-blue-50 rounded-lg p-3 text-center">
            <p class="text-xs text-gray-500 mb-1">Recibido</p>
            <p class="text-lg font-bold text-blue-600">${{ formatMoneda(balance.recibido) }}</p>
          </div>
          <div class="bg-red-50 rounded-lg p-3 text-center">
            <p class="text-xs text-gray-500 mb-1">Deudas</p>
            <p class="text-lg font-bold text-red-500">${{ formatMoneda(balance.deudas) }}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 text-center">
            <p class="text-xs text-gray-500 mb-1">Neto</p>
            <p class="text-lg font-bold text-gray-700">${{ formatMoneda(balance.neto) }}</p>
          </div>
        </div>
      </div>

      <!-- ── Participantes del parche ───────────────────────────── -->
      <div class="bg-white rounded-xl shadow-sm p-5">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">👥 Participantes</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="miembro in miembros"
            :key="miembro.id"
            class="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3"
          >
            <!-- Avatar -->
            <div class="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center overflow-hidden shrink-0">
              <img v-if="miembro.photo" :src="miembro.photo" class="w-full h-full object-cover" />
              <span v-else class="text-sm font-bold text-brand-600">
                {{ miembro.username?.charAt(0).toUpperCase() }}
              </span>
            </div>
            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-800 truncate">
                {{ miembro.username }}
                <span v-if="miembro.id === auth.user?.id" class="text-xs text-brand-500 font-normal ml-1">(tú)</span>
              </p>
              <p v-if="miembro.nickname" class="text-xs text-gray-400 truncate">@{{ miembro.nickname }}</p>
              <!-- Cuenta bancaria principal -->
              <div v-if="miembro.cuenta_principal" class="flex items-center gap-1 mt-1">
                <span class="text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full capitalize font-medium">
                  {{ miembro.cuenta_principal.bank }}
                </span>
                <span class="text-xs text-gray-500 font-mono truncate">
                  {{ miembro.cuenta_principal.number }}
                </span>
              </div>
              <p v-else class="text-xs text-gray-400 mt-1 italic">Sin cuenta registrada</p>
            </div>
          </div>
        </div>
      </div>


      <!-- ── Layout 2 columnas: Eventos | Suscripciones ─────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

        <!-- Columna izquierda: Eventos (60%) -->
        <div class="lg:col-span-3 space-y-4">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-800">Eventos</h2>
            <button
              @click="mostrarFormEvento = !mostrarFormEvento"
              class="text-sm bg-brand-500 text-white px-4 py-1.5 rounded-lg hover:bg-brand-600 transition font-medium"
            >
              {{ mostrarFormEvento ? '✕ Cancelar' : '+ Nuevo evento' }}
            </button>
          </div>

          <!-- Formulario crear evento (colapsable) -->
          <div v-if="mostrarFormEvento" class="bg-white rounded-xl shadow-sm p-5 border border-brand-200">
            <h3 class="text-base font-semibold text-gray-700 mb-3">Nuevo evento</h3>
            <form @submit.prevent="handleCrearEvento" class="space-y-3">
              <input
                v-model="eventoForm.name"
                placeholder="Nombre del evento"
                required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <div class="grid grid-cols-2 gap-3">
                <input
                  v-model="eventoForm.total_amount"
                  placeholder="Monto total"
                  type="number"
                  required
                  class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
                <select
                  v-model="eventoForm.split_type"
                  class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                  <option disabled value="">División</option>
                  <option value="equal">Partes iguales</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>

              <select
                v-model="eventoForm.responsible_id" required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <option disabled value="">Seleccione un responsable</option>
                <option v-for="miembro in miembros" :key="miembro.id" :value="miembro.id">
                  {{ miembro.username }}
                </option>
              </select>

              <!-- Participantes -->
              <div>
                <label class="block text-xs text-gray-500 mb-1">Participantes</label>
                <div class="space-y-2 border border-gray-300 rounded-lg px-4 py-2">
                  <label
                    v-for="miembro in miembros"
                    :key="miembro.id"
                    class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      :value="miembro.id"
                      v-model="eventoForm.participant_ids"
                      class="accent-brand-500"
                    />
                    <span class="flex-1">{{ miembro.username }}</span>
                    <input
                      v-if="eventoForm.split_type === 'custom' && eventoForm.participant_ids.includes(miembro.id)"
                      :value="eventoForm.custom_amounts[miembro.id] || ''"
                      @input="eventoForm.custom_amounts[miembro.id] = $event.target.value"
                      type="number"
                      min="0"
                      placeholder="Monto"
                      class="w-24 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                  </label>
                </div>
              </div>

              <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
              <button
                type="submit"
                class="w-full bg-brand-500 text-white py-2 rounded-lg hover:bg-brand-600 transition font-medium"
              >
                Crear evento
              </button>
            </form>
          </div>

          <!-- Lista de eventos -->
          <div
            v-for="(evento, i) in eventos"
            :key="i"
            :id="'evento-' + evento.id"
            class="bg-white rounded-xl shadow-sm p-5 transition-all duration-1000"
          >
            <div class="flex justify-between items-start mb-3">
              <div>
                <p class="font-semibold text-gray-800">{{ evento.name }}</p>
                <p class="text-sm text-gray-500">Total: ${{ formatMoneda(evento.total_amount) }}</p>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded-full">
                  {{ evento.participants?.length }} participantes
                </span>
                <button
                  v-if="isCreator"
                  @click="handleEliminarEvento(evento.id)"
                  class="text-xs text-red-400 hover:text-red-600 hover:underline transition"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div class="space-y-2">
              <div
                v-for="(p, j) in evento.participants"
                :key="j"
                class="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-2"
              >
                <div>
                  <p class="text-sm font-medium text-gray-700">{{ p.user?.username }}</p>
                  <p class="text-xs text-gray-500">
                    Debe: ${{ formatMoneda(p.amount_owed) }}
                    <span v-if="p.amount_paid > 0 && !p.paid" class="text-brand-500 font-medium ml-1 block mt-0.5">
                      (Abonado: ${{ formatMoneda(p.amount_paid) }})
                    </span>
                  </p>
                </div>
                <div>
                  <span v-if="p.paid" class="text-green-500 text-sm font-medium">✅ Pagado</span>
                  <button
                    v-else-if="p.user && auth.user && p.user.id === auth.user.id"
                    @click="openPaymentModal(p, evento)"
                    class="text-xs text-white px-3 py-1 rounded-full transition"
                    :class="p.amount_paid > 0 ? 'bg-brand-500 hover:bg-brand-600' : 'bg-green-600 hover:bg-green-700'"
                  >
                    {{ p.amount_paid > 0 ? 'Completar' : 'Pagar' }}
                  </button>
                  <span v-else class="text-sm font-medium" :class="p.amount_paid > 0 ? 'text-brand-500' : 'text-red-400'">
                    {{ p.amount_paid > 0 ? '⏳ Parcial' : '❌ Pendiente' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p v-if="eventos.length === 0" class="text-gray-400 text-sm text-center bg-white rounded-xl py-6">
            No hay eventos aún
          </p>
        </div>

        <!-- Columna derecha: Suscripciones (40%) -->
        <div class="lg:col-span-2 space-y-4">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold text-gray-800">Suscripciones</h2>
            <button
              @click="mostrarFormSus = !mostrarFormSus"
              class="text-sm bg-brand-500 text-white px-4 py-1.5 rounded-lg hover:bg-brand-600 transition font-medium"
            >
              {{ mostrarFormSus ? '✕ Cancelar' : '+ Nueva' }}
            </button>
          </div>

          <!-- Formulario nueva suscripción (colapsable) -->
          <div v-if="mostrarFormSus" class="bg-white rounded-xl shadow-sm p-5 border border-brand-200">
            <h3 class="text-base font-semibold text-gray-700 mb-3">Nueva suscripción</h3>
            <form @submit.prevent="handleCrearSuscripcion" class="space-y-3">
              <input
                v-model="susForm.name"
                placeholder="Nombre (ej: Netflix)"
                required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <input
                v-model="susForm.amount"
                placeholder="Monto mensual"
                type="number"
                min="0"
                required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <div>
                <label class="block text-xs text-gray-500 mb-1">Fecha de corte</label>
                <input
                  v-model="susForm.cutoff_date"
                  type="date"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
              <select
                v-model="susForm.responsible_id"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <option value="">Sin responsable</option>
                <option v-for="miembro in miembros" :key="miembro.id" :value="miembro.id">
                  {{ miembro.username }}
                </option>
              </select>
              <button
                type="submit"
                class="w-full bg-brand-500 text-white py-2 rounded-lg hover:bg-brand-600 transition font-medium"
              >
                Agregar suscripción
              </button>
            </form>
          </div>

          <!-- Lista de suscripciones -->
          <div class="space-y-3">
            <div
              v-for="sus in suscripciones"
              :key="sus.id"
              :id="'suscripcion-' + sus.id"
              class="bg-white rounded-xl shadow-sm p-4 flex justify-between items-start transition-all duration-1000"
            >
              <div>
                <p class="font-semibold text-gray-800">{{ sus.name }}</p>
                <p class="text-sm text-gray-500">
                  ${{ formatMoneda(sus.amount) }} · Corte: {{ formatFecha(sus.cutoff_date) }}
                </p>
                <p class="text-xs text-gray-400 mt-1">
                  Responsable: {{ sus.responsible?.username || '—' }}
                </p>
              </div>
              <button
                v-if="isCreator"
                @click="handleEliminarSuscripcion(sus.id)"
                class="text-xs text-red-400 hover:text-red-600 hover:underline transition ml-2"
              >
                Eliminar
              </button>
            </div>
          </div>

          <p v-if="suscripciones.length === 0" class="text-gray-400 text-sm text-center bg-white rounded-xl py-6">
            No hay suscripciones aún
          </p>
        </div>
      </div>

      <!-- ── Finanzas del parche ────────────────────────────────── -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-gray-800">💰 Finanzas del parche</h2>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <!-- Balance mutuo -->
          <div class="bg-white rounded-xl shadow-sm p-5">
            <h3 class="text-base font-semibold text-gray-700 mb-3">Balance con cada miembro</h3>
            <div v-if="Object.keys(balanceMutuo).length > 0" class="space-y-2">
              <div
                v-for="(monto, usuario) in balanceMutuo"
                :key="usuario"
                class="flex justify-between items-center px-4 py-2 rounded-lg"
                :class="monto >= 0 ? 'bg-green-50' : 'bg-red-50'"
              >
                <span class="text-sm text-gray-700">{{ usuario }}</span>
                <span
                  class="text-sm font-semibold"
                  :class="monto >= 0 ? 'text-green-600' : 'text-red-500'"
                >
                  {{ monto >= 0 ? '+' : '' }}${{ formatMoneda(monto) }}
                </span>
              </div>
            </div>
            <p v-else class="text-sm text-gray-400 text-center">Sin movimientos entre miembros aún</p>
          </div>

          <!-- Historial de transacciones + Registrar pago -->
          <div class="space-y-4">
            <div class="bg-white rounded-xl shadow-sm p-5">
              <h3 class="text-base font-semibold text-gray-700 mb-3">Historial de transacciones</h3>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div
                  v-for="tx in transacciones"
                  :key="tx.id"
                  :id="'transaccion-' + tx.id"
                  class="flex justify-between items-start bg-gray-50 rounded-lg px-4 py-3 transition-all duration-1000"
                >
                  <div>
                    <p class="text-sm font-medium text-gray-800">
                      {{ tx.from_user?.username }} → {{ tx.to_user?.username }}
                    </p>
                    <p class="text-xs text-gray-500">{{ tx.concept || '(sin concepto)' }}</p>
                    <p class="text-xs text-gray-400">{{ formatFecha(tx.created_at?.split('T')[0]) }}</p>
                  </div>
                  <span
                    class="text-sm font-semibold whitespace-nowrap ml-4"
                    :class="tx.type === 'pago' ? 'text-green-600' : 'text-red-500'"
                  >
                    ${{ formatMoneda(tx.amount) }}
                  </span>
                </div>
                <p v-if="transacciones.length === 0" class="text-sm text-gray-400 text-center">
                  No hay transacciones registradas
                </p>
              </div>
            </div>

            <!-- Registrar pago manual (colapsable) -->
            <div class="bg-white rounded-xl shadow-sm p-5">
              <div class="flex justify-between items-center">
                <h3 class="text-base font-semibold text-gray-700">Registrar pago manual</h3>
                <button
                  @click="mostrarFormTx = !mostrarFormTx"
                  class="text-sm bg-gold-500 text-white px-3 py-1.5 rounded-lg hover:bg-gold-600 transition font-medium"
                >
                  {{ mostrarFormTx ? '✕ Cancelar' : '+ Registrar' }}
                </button>
              </div>
              <form v-if="mostrarFormTx" @submit.prevent="handleCrearTransaccion" class="space-y-3 mt-3">
                <select
                  v-model="txForm.to_user_id"
                  required
                  class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                  <option value="">¿A quién le pagas?</option>
                  <option
                    v-for="m in miembros.filter(m => m.id !== auth.user?.id)"
                    :key="m.id"
                    :value="m.id"
                  >
                    {{ m.username }}
                  </option>
                </select>
                <div class="grid grid-cols-2 gap-3">
                  <input
                    v-model="txForm.amount"
                    type="number"
                    min="0"
                    placeholder="Monto"
                    required
                    class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                  <input
                    v-model="txForm.concept"
                    placeholder="Concepto (opcional)"
                    class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                </div>
                <button
                  type="submit"
                  class="w-full bg-gold-500 text-white py-2 rounded-lg hover:bg-gold-600 transition font-medium"
                >
                  Registrar pago
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>

      <!-- ── Ahorros colectivos ─────────────────────────────────── -->
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-800">🏦 Ahorros colectivos</h2>
          <button
            @click="mostrarFormAhorro = !mostrarFormAhorro"
            class="text-sm bg-brand-500 text-white px-4 py-1.5 rounded-lg hover:bg-brand-600 transition font-medium"
          >
            {{ mostrarFormAhorro ? '✕ Cancelar' : '+ Nuevo espacio' }}
          </button>
        </div>

        <!-- Formulario nuevo espacio de ahorro (colapsable) -->
        <div v-if="mostrarFormAhorro" class="bg-white rounded-xl shadow-sm p-5 border border-brand-200">
          <h3 class="text-base font-semibold text-gray-700 mb-3">Crear espacio de ahorro</h3>
          <form @submit.prevent="handleCrearAhorro" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              v-model="ahorroForm.name"
              placeholder="Nombre (ej: Viaje a Cartagena)"
              required
              class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <input
              v-model="ahorroForm.description"
              placeholder="Descripción (opcional)"
              class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <input
              v-model="ahorroForm.goal_amount"
              type="number"
              min="1"
              placeholder="Meta de ahorro ($)"
              required
              class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <div>
              <label class="block text-xs text-gray-500 mb-1">Fecha objetivo (opcional)</label>
              <input
                v-model="ahorroForm.target_date"
                type="date"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <button
              type="submit"
              class="sm:col-span-2 w-full bg-brand-500 text-white py-2 rounded-lg hover:bg-brand-600 transition font-medium"
            >
              Crear espacio
            </button>
          </form>
        </div>

        <!-- Grid de espacios de ahorro -->
        <div class="space-y-4">
          <div
            v-for="espacio in ahorros"
            :key="espacio.id"
            :id="'ahorro-' + espacio.id"
            class="bg-white rounded-xl shadow-sm p-5 transition-all duration-1000"
          >
            <!-- Cabecera -->
            <div class="flex justify-between items-start mb-3">
              <div>
                <p class="font-semibold text-gray-800">{{ espacio.name }}</p>
                <p v-if="espacio.description" class="text-xs text-gray-400 mt-0.5">
                  {{ espacio.description }}
                </p>
              </div>
              <button
                v-if="isCreator"
                @click="handleEliminarAhorro(espacio.id)"
                class="text-xs text-red-400 hover:text-red-600 hover:underline transition ml-3"
              >
                Eliminar
              </button>
            </div>

            <!-- Barra de progreso + aportes en 2 columnas -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

              <!-- Izquierda: progreso -->
              <div>
                <div class="flex justify-between text-xs text-gray-500 mb-1">
                  <span>${{ formatMoneda(espacio.current_amount) }} ahorrado</span>
                  <span>Meta: ${{ formatMoneda(espacio.goal_amount) }}</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    class="bg-brand-500 h-2.5 rounded-full transition-all"
                    :style="{ width: Math.min(espacio.progress_percentage, 100) + '%' }"
                  />
                </div>
                <p class="text-xs text-right text-brand-500 mt-1 font-medium">
                  {{ espacio.progress_percentage }}%
                  <span v-if="espacio.target_date"> · Fecha: {{ formatFecha(espacio.target_date) }}</span>
                </p>

                <!-- Aportes recientes -->
                <div v-if="espacio.aportes?.length > 0" class="space-y-1 mt-3">
                  <p class="text-xs font-medium text-gray-500">Aportes recientes</p>
                  <div
                    v-for="aporte in espacio.aportes"
                    :key="aporte.id"
                    class="flex justify-between text-xs bg-gray-50 rounded px-3 py-1.5"
                  >
                    <span class="text-gray-700">{{ aporte.user?.username }}</span>
                    <span class="text-green-600 font-medium">
                      +${{ formatMoneda(aporte.amount) }}
                      <span v-if="aporte.note" class="text-gray-400 font-normal ml-1">· {{ aporte.note }}</span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Derecha: formulario aportar -->
              <div class="flex flex-col justify-center">
                <p class="text-xs font-medium text-gray-500 mb-2">Hacer un aporte</p>
                <form @submit.prevent="handleAportar(espacio.id, $event)" class="space-y-2">
                  <input
                    :name="'monto-' + espacio.id"
                    type="number"
                    min="1"
                    placeholder="Monto a aportar ($)"
                    required
                    class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                  <input
                    :name="'nota-' + espacio.id"
                    type="text"
                    placeholder="Nota (opcional)"
                    class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                  <button
                    type="submit"
                    class="w-full bg-brand-500 text-white py-2 rounded-lg text-sm hover:bg-brand-600 transition font-medium"
                  >
                    Aportar
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>


        <p v-if="ahorros.length === 0" class="text-gray-400 text-sm text-center bg-white rounded-xl py-6">
          No hay espacios de ahorro aún
        </p>
      </div>

      <PaymentModal
        :isOpen="isPaymentModalOpen"
        :participant="selectedParticipant"
        @close="isPaymentModalOpen = false"
        @payment-success="onPaymentSuccess"
      />

    </div>
  </div>

  <div v-else class="min-h-screen flex items-center justify-center">
    <p class="text-gray-400">Cargando...</p>
  </div>
</template>

<script setup>
import AppNavbar from '@/components/AppNavbar.vue'
import PaymentModal from '@/components/PaymentModal.vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import api from '@/services/api.js'
import { useAuthStore } from '@/stores/auth.js'
import { useParchesStore } from '@/stores/parches.js'
import { buildEventPayload, formatCurrency, formatDate } from '@/utils/parcheFormatting.js'

const route   = useRoute()
const router  = useRouter()
const parches = useParchesStore()
const auth    = useAuthStore()

const isCreator = computed(() => parche.value?.creator?.id === auth.user?.id)

const parche         = ref(null)
const eventos        = ref([])
const miembros       = ref([])
const suscripciones  = ref([])
const transacciones  = ref([])
const balanceMutuo   = ref({})
const ahorros        = ref([])
const error          = ref(null)
const balance        = ref({ pagado: 0, recibido: 0, deudas: 0, neto: 0 })
const copiado        = ref(false)


// Toggles para formularios colapsables
const mostrarFormEvento  = ref(false)
const mostrarFormSus     = ref(false)
const mostrarFormTx      = ref(false)
const mostrarFormAhorro  = ref(false)

const eventoForm = reactive({
  name:           '',
  total_amount:   '',
  split_type:     'equal',
  responsible_id: '',
  participant_ids: [],
  custom_amounts:   {},
})

const susForm = reactive({
  name:           '',
  amount:         '',
  cutoff_date:    '',
  responsible_id: '',
})

const txForm = reactive({
  to_user_id: '',
  amount:     '',
  concept:    '',
  type:       'pago',
})

const ahorroForm = reactive({
  name:        '',
  description: '',
  goal_amount: '',
  target_date: '',
})

onMounted(async () => {
  await auth.fetchProfile()
  parche.value = await parches.fetchParche(route.params.id)

  // Carga inicial de miembros desde el parche (rápido, sin llamada extra)
  if (parche.value?.memberships) {
    miembros.value = parche.value.memberships.map(m => ({
      id: m.user.id,
      username: m.user.username,
      nickname: m.user.nickname,
      photo: m.user.photo,
      cuenta_principal: null
    }))
  }

  await fetchEventos()
  await fetchBalance()
  await fetchMiembros()
  await fetchSuscripciones()
  await fetchTransacciones()
  await fetchBalanceMutuo()
  await fetchAhorros()
})

const fetchEventos = async () => {
  try {
    const { data } = await api.get(`/parches/${route.params.id}/eventos/`)
    eventos.value = data.map(evento => ({
      ...evento,
      participants: evento.participants.filter(p => p !== null && p.user !== null)
    }))
  } catch (e) {
    console.error('error cargando eventos:', e.response?.data)
  }
}

const fetchBalance = async () => {
  const { data } = await api.get(`/parches/${route.params.id}/balance/personal/`)
  balance.value = data
}

const fetchMiembros = async () => {
  try {
    const { data } = await api.get(`/parches/${route.params.id}/members/`)
    miembros.value = data
  } catch (e) {
    // Fallback: usar memberships ya cargados del parche
    console.warn('[fetchMiembros] Fallback a memberships del parche:', e.response?.status)
    if (parche.value?.memberships) {
      miembros.value = parche.value.memberships.map(m => ({
        id: m.user.id,
        username: m.user.username,
        nickname: m.user.nickname,
        photo: m.user.photo,
        cuenta_principal: null
      }))
    }
  }
}

const fetchSuscripciones = async () => {
  try {
    const { data } = await api.get(`/parches/${route.params.id}/suscripciones/`)
    suscripciones.value = data
  } catch (e) {
    console.error('error cargando suscripciones:', e.response?.data)
  }
}

const fetchTransacciones = async () => {
  try {
    const { data } = await api.get(`/parches/${route.params.id}/transacciones/`)
    transacciones.value = data
  } catch (e) {
    console.error('error cargando transacciones:', e.response?.data)
  }
}

const fetchBalanceMutuo = async () => {
  try {
    const { data } = await api.get(`/parches/${route.params.id}/balance/mutuo/`)
    balanceMutuo.value = data
  } catch (e) {
    console.error('error cargando balance mutuo:', e.response?.data)
  }
}

const handleCrearTransaccion = async () => {
  try {
    await api.post(`/parches/${route.params.id}/transacciones/`, {
      to_user_id: txForm.to_user_id,
      amount:     txForm.amount,
      concept:    txForm.concept,
      type:       'pago',
    })
    txForm.to_user_id = ''
    txForm.amount     = ''
    txForm.concept    = ''
    error.value       = null
    mostrarFormTx.value = false
    await fetchTransacciones()
    await fetchBalanceMutuo()
    await fetchBalance()
  } catch {
    error.value = 'Error al registrar el pago'
  }
}

const formatFecha = (fecha) => formatDate(fecha)

const formatMoneda = (valor) => formatCurrency(valor)

const handleCrearSuscripcion = async () => {
  try {
    await api.post(`/parches/${route.params.id}/suscripciones/`, {
      name:           susForm.name,
      amount:         susForm.amount,
      cutoff_date:    susForm.cutoff_date,
      responsible_id: susForm.responsible_id || null,
    })
    susForm.name           = ''
    susForm.amount         = ''
    susForm.cutoff_date    = ''
    susForm.responsible_id = ''
    error.value            = null
    mostrarFormSus.value   = false
    await fetchSuscripciones()
  } catch {
    error.value = 'Error al crear la suscripción'
  }
}

const handleEliminarSuscripcion = async (id) => {
  try {
    await api.delete(`/parches/${route.params.id}/suscripciones/${id}/`)
    error.value = null
    await fetchSuscripciones()
  } catch {
    error.value = 'Error al eliminar la suscripción'
  }
}

const handleCrearEvento = async () => {
  try {
    const payload = buildEventPayload({
      name: eventoForm.name,
      totalAmount: eventoForm.total_amount,
      splitType: eventoForm.split_type,
      responsibleId: eventoForm.responsible_id,
      participantIds: eventoForm.participant_ids,
      customAmounts: eventoForm.custom_amounts,
      currentUserId: auth.user?.id,
    })

    await api.post(`/parches/${route.params.id}/eventos/`, payload)

    eventoForm.name            = ''
    eventoForm.total_amount    = ''
    eventoForm.responsible_id  = ''
    eventoForm.participant_ids = []
    eventoForm.custom_amounts   = {}
    error.value                = null
    mostrarFormEvento.value    = false
    await fetchEventos()
    await fetchBalance()
  } catch (e) {
    const detail = e.response?.data?.custom_amounts
    error.value = detail ? detail : 'Error al crear el evento'
  }
}
const isPaymentModalOpen = ref(false)
const selectedParticipant = ref(null)

const openPaymentModal = (participant, evento) => {
  console.log('openPaymentModal called with:', { participant, evento })
  const safeEvento = {
    name: evento.name,
    responsible: evento.responsible
  }
  selectedParticipant.value = { ...participant, evento: safeEvento }
  isPaymentModalOpen.value = true
}

const onPaymentSuccess = async () => {
  await fetchEventos()
  await fetchBalance()
  await fetchTransacciones()
  await fetchBalanceMutuo()
}
const fetchAhorros = async () => {
  try {
    const { data } = await api.get(`/parches/${route.params.id}/ahorros/`)
    ahorros.value = data
  } catch (e) {
    console.error('error cargando ahorros:', e.response?.data)
  }
}

const handleCrearAhorro = async () => {
  try {
    await api.post(`/parches/${route.params.id}/ahorros/`, {
      name:        ahorroForm.name,
      description: ahorroForm.description || '',
      goal_amount: ahorroForm.goal_amount,
      target_date: ahorroForm.target_date || null,
    })
    ahorroForm.name        = ''
    ahorroForm.description = ''
    ahorroForm.goal_amount = ''
    ahorroForm.target_date = ''
    error.value            = null
    mostrarFormAhorro.value = false
    await fetchAhorros()
  } catch {
    error.value = 'Error al crear el espacio de ahorro'
  }
}

const handleEliminarAhorro = async (id) => {
  try {
    await api.delete(`/parches/${route.params.id}/ahorros/${id}/`)
    error.value = null
    await fetchAhorros()
  } catch {
    error.value = 'Error al eliminar el espacio de ahorro'
  }
}

const handleAportar = async (espacioId, event) => {
  const form  = event.target
  const monto = form[`monto-${espacioId}`].value
  const nota  = form[`nota-${espacioId}`].value
  try {
    await api.post(`/ahorros/${espacioId}/aportar/`, {
      amount: monto,
      note:   nota || '',
    })
    form[`monto-${espacioId}`].value = ''
    form[`nota-${espacioId}`].value  = ''
    error.value = null
    await fetchAhorros()
  } catch {
    error.value = 'Error al registrar el aporte'
  }
}

const handleEliminarEvento = async (id) => {
  try {
    await api.delete(`/parches/${route.params.id}/eventos/${id}/`)
    error.value = null
    await fetchEventos()
    await fetchBalance()
  } catch {
    error.value = 'Error al eliminar el evento'
  }
}

async function copiarCodigo() {
  if (!parche.value?.invite_code) return

  try {
    await navigator.clipboard.writeText(parche.value.invite_code)
    copiado.value = true
    setTimeout(() => {
      copiado.value = false
    }, 2000)
  } catch (err) {
    console.error('Error al copiar el código:', err)
  }
}

const eliminarParche = async () => {
  if (confirm(`¿Estás seguro de que quieres eliminar el parche "${parche.value.name}"? Esta acción es irreversible y eliminará todos los eventos, deudas y ahorros.`)) {
    try {
      await api.delete(`/parches/${route.params.id}/`)
      router.push('/')
    } catch (e) {
      alert('Hubo un error al eliminar el parche. Solo el creador puede eliminarlo.')
    }
  }
}

const checkHighlight = () => {
  const type = route.query.highlight
  const id = route.query.id
  if (type && id) {
    setTimeout(() => {
      const el = document.getElementById(`${type}-${id}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add('ring-4', 'ring-brand-500', 'bg-brand-50')
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-brand-500', 'bg-brand-50')
        }, 3000)
      }
    }, 500)
  }
}

watch(() => route.query, () => {
  checkHighlight()
})

onMounted(async () => {
  await auth.fetchProfile()
  parche.value = await parches.fetchParche(route.params.id)

  if (parche.value?.memberships) {
    miembros.value = parche.value.memberships.map(m => ({
      id: m.user.id,
      username: m.user.username,
      nickname: m.user.nickname,
      photo: m.user.photo,
      cuenta_principal: m.user.cuentas_bancarias?.find(c => c.is_primary) || m.user.cuentas_bancarias?.[0]
    }))
  }

  await Promise.all([
    fetchEventos(),
    fetchBalance(),
    fetchSuscripciones(),
    fetchAhorros(),
    fetchTransacciones(),
    fetchBalanceMutuo()
  ])
  
  checkHighlight()
})
</script>
