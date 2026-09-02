import { BookingListSkeleton } from "@/features/bookings/components/BookingListSkeleton";

export default function ReceivedRentalsLoading() {
  return <BookingListSkeleton label="Carregando aluguéis recebidos" />;
}
