import type { Meta, StoryObj } from '@storybook/vue3';
import SearchFilters from '@/components/SearchFilters.vue';

const meta = {
  title: 'Components/SearchFilters',
  component: SearchFilters,
  args: {},
} satisfies Meta<typeof SearchFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

