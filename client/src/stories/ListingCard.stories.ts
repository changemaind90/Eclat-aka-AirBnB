import type { Meta, StoryObj } from '@storybook/vue3';
import ListingCard from '@/components/ListingCard.vue';

const meta = {
  title: 'Components/ListingCard',
  component: ListingCard,
  args: {
    listing: {
      id: 1,
      title: 'Cozy apartment in center',
      description: 'A cozy place in the city center',
      address: 'Russia, Moscow, Tverskaya 1',
      pricePerNight: 4500,
      numberOfGuests: 2,
      ownerId: 1,
      images: [],
    },
    canBook: true,
    canCancel: false,
    canEdit: false,
  },
} satisfies Meta<typeof ListingCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

