import Swal from 'sweetalert2';

export const CustomSwal = Swal.mixin({
    customClass: {
        popup: 'rounded-3xl border border-gray-100 shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] bg-white/95 backdrop-blur-xl p-6',
        title: 'text-2xl font-bold text-slate-800 tracking-tight mt-2',
        htmlContainer: 'text-base text-slate-500 font-medium leading-relaxed mt-2',
        icon: 'border-0 scale-125 mb-4',
        confirmButton: 'px-8 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-all duration-300 shadow-lg shadow-cyan-500/30 font-semibold mx-2',
        cancelButton: 'px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all duration-300 font-semibold mx-2',
        denyButton: 'px-8 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 shadow-lg shadow-red-500/30 font-semibold mx-2',
        input: 'rounded-xl border-slate-200 focus:border-cyan-500 focus:ring focus:ring-cyan-500/20 text-slate-700 w-full'
    },
    buttonsStyling: false
});

export default CustomSwal;
