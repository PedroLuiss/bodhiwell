document.addEventListener('DOMContentLoaded', function () {
    const patientSelect = document.getElementById('Refund_patient');
    const bookingSelect = document.getElementById('Refund_booking');

    if (!patientSelect || !bookingSelect) return;

    patientSelect.addEventListener('change', function () {
        const patientId = this.value;

        bookingSelect.innerHTML = '<option value="">Cargando...</option>';
        bookingSelect.disabled = true;

        if (!patientId) {
            bookingSelect.innerHTML = '<option value="">Seleccione una reserva</option>';
            return;
        }

        fetch(`/admin/ajax/bookings/by-patient/${patientId}`)
            .then(response => response.json())
            .then(data => {
                bookingSelect.innerHTML = '<option value="">Seleccione una reserva</option>';

                if (data.length === 0) {
                    const option = document.createElement('option');
                    option.text = "No hay reservas disponibles";
                    bookingSelect.add(option);
                } else {
                    data.forEach(booking => {
                        const option = document.createElement('option');
                        option.value = booking.id;
                        option.text = booking.label;
                        bookingSelect.add(option);
                    });
                }
                bookingSelect.disabled = false;
            })
            .catch(error => {
                console.error('Error cargando reservas:', error);
                bookingSelect.innerHTML = '<option value="">Error al cargar</option>';
            });
    });
});
