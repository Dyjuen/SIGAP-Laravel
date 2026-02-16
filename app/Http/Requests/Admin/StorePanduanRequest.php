<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StorePanduanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'judul_panduan' => ['required', 'string', 'max:200'],
            'tipe_media' => ['required', 'in:document,video'],
            'path_media' => [
                'required_if:tipe_media,video',
                'nullable',
                'url',
                'regex:/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//',
            ],
            'file' => [
                'required_if:tipe_media,document',
                'nullable',
                'file',
                'mimes:pdf,doc,docx,ppt,pptx,xls,xlsx',
                'max:10240', // 10MB
            ],
            'target_role_id' => ['nullable', 'exists:m_roles,role_id'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'judul_panduan' => 'Judul Panduan',
            'tipe_media' => 'Tipe Media',
            'path_media' => 'URL Video',
            'file' => 'File Dokumen',
            'target_role_id' => 'Target Peran',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'required' => ':attribute wajib diisi.',
            'required_if' => ':attribute wajib diisi jika tipe media adalah :value.',
            'in' => ':attribute harus berupa dokumen atau video.',
            'url' => ':attribute harus berupa URL yang valid.',
            'regex' => ':attribute harus berupa link YouTube yang valid.',
            'mimes' => ':attribute harus berupa file dengan format: :values.',
            'max' => ':attribute tidak boleh lebih dari :max kilobyte.',
            'exists' => ':attribute yang dipilih tidak valid.',
        ];
    }
}
