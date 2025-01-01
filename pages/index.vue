<<template>
  <draggable v-model="projects" item-key="id">
    <template #item="{ element }">
      <div class="project">
        <p>{{ element.name }}</p>
      </div>
    </template>
  </draggable>
  <div class="projects-after-update">
    <div class="project" v-for="project in projects" :key="project.id">
      <p>{{ project.name }}</p>
    </div>
  </div>
</template>

  <script setup>
  import { ref } from 'vue';
  import draggable from 'vuedraggable';

  const projects = ref([
    {
      id: 1,
      name: 'Project 1',
      arrange: 3
    },
    {
      id: 2,
      name: 'Project 2',
      arrange: 2
    },
    {
      id: 3,
      name: 'Project 3',
      arrange: 1
    },
  ]);
</script>

  <style scoped>
  .project {
    padding: 10px;
    font-size: 18px;
    font-weight: bold;
    font-family: sans-serif;
    text-transform: capitalize;
    background-color: rgb(66, 66, 66);
    margin-bottom: 10px;
    border-radius: 10px;
    color: white;
    cursor: grab;
  }

  .projects-after-update {
    margin-top: 40px;
  }

  .projects-after-update .project {
    background-color: rgb(0, 0, 0);
  }
</style>
  >