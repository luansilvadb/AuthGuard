<template>
  <div class="dashboard-container">
    <div class="dashboard-widgets">
      <div class="dashboard-card users">
        <div class="card-icon"><UserOutlined /></div>
        <div class="dashboard-metric">1.200</div>
        <div class="dashboard-label">Usuários</div>
      </div>
      <div class="dashboard-card tenants">
        <div class="card-icon"><TeamOutlined /></div>
        <div class="dashboard-metric">8</div>
        <div class="dashboard-label">Tenants Ativos</div>
      </div>
      <div class="dashboard-card login">
        <div class="card-icon"><SafetyCertificateOutlined /></div>
        <div class="dashboard-metric">14/07/2025</div>
        <div class="dashboard-label">Último Login</div>
      </div>
      <div class="dashboard-card chart">
        <div class="card-icon"><BarChartOutlined /></div>
        <div class="dashboard-chart-placeholder">
          <div class="chart-bar" v-for="i in 6" :key="i" :style="{height: (30 + i*10) + 'px'}"></div>
        </div>
        <div class="dashboard-label">Atividade Recente</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UserOutlined, TeamOutlined, SafetyCertificateOutlined, BarChartOutlined } from '@ant-design/icons-vue';
</script>

<style scoped>
.dashboard-container {
  width: 100%;
  min-height: 100%;
  padding: 0 0 32px 0;
}

.dashboard-header {
  margin-bottom: 32px;
}

.dashboard-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.dashboard-subtitle {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
}

.dashboard-widgets {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.dashboard-card {
  background: linear-gradient(135deg, #f8fafc 60%, #e0e7ef 100%);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(30, 64, 175, 0.08);
  padding: 28px 32px 20px 32px;
  min-width: 220px;
  flex: 1 1 220px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  transition: box-shadow 0.2s;
}
.dashboard-card:hover {
  box-shadow: 0 8px 32px rgba(30, 64, 175, 0.13);
}
.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-bottom: 18px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.10);
}
.dashboard-metric {
  font-size: 2.3rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}
.dashboard-label {
  font-size: 1rem;
  color: #3b82f6;
  font-weight: 600;
  margin-top: 2px;
}
.dashboard-card.chart {
  align-items: stretch;
}
.dashboard-chart-placeholder {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 60px;
  margin-bottom: 8px;
  margin-top: 2px;
}
.chart-bar {
  width: 12px;
  border-radius: 4px 4px 0 0;
  background: linear-gradient(180deg, #3b82f6 0%, #1e40af 100%);
  opacity: 0.8;
  transition: height 0.3s;
}
@media (max-width: 900px) {
  .dashboard-widgets {
    flex-direction: column;
    gap: 18px;
  }
  .dashboard-card {
    min-width: 0;
    width: 100%;
  }
}
</style> 