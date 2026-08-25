import { BookingListSkeleton } from "@/features/bookings/components/BookingListSkeleton";

export default function ReceivedBookingsLoading() {
  return <BookingListSkeleton label="Carregando solicitações recebidas" />;
}
