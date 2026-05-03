import type { Meta, StoryObj } from '@storybook/vue3';
import ListingCard from '@/components/ListingCard.vue';

const meta = {
  title: 'Components/ListingCard',
  component: ListingCard,
  args: {
    listing: {
      id: 1,
      title: 'Cozy apartment in center',
      price: 4500,
      images: [],
      userId: 1,
    },
    canBook: true,
    canCancel: false,
    canEdit: false,
  },
} satisfies Meta<typeof ListingCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

