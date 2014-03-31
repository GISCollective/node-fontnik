/*****************************************************************************
 *
 * This file is part of Mapnik (c++ mapping toolkit)
 *
 * Copyright (C) 2013 Artem Pavlenko
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 *
 *****************************************************************************/

#include "harfbuzz_shaper.hpp"
#include "glyph_info.hpp"

#include <iostream>

HarfbuzzShaper::HarfbuzzShaper()
    : font_manager_(font_engine_) {};

HarfbuzzShaper::~HarfbuzzShaper() {};

void HarfbuzzShaper::Shape(std::string &value,
                           std::string &fontstack) {

    const double scale_factor = 1.0;

    UnicodeString const &text = value.data();
    text_line line(0, value.size() - 1);

    // DEBUG
    std::string str;
    text.toUTF8String(str);
    // std::cout<<str<<'\n'; 

    unsigned start = line.first_char();
    unsigned end = line.last_char();

    size_t length = end - start;
    if (!length) return;
    line.reserve(length);

    // Preallocate memory based on estimated length.
    line.reserve(length);

    auto hb_buffer_deleter = [](hb_buffer_t * buffer) { hb_buffer_destroy(buffer);};
    const std::unique_ptr<hb_buffer_t, decltype(hb_buffer_deleter)> buffer(hb_buffer_create(),hb_buffer_deleter);
    hb_buffer_set_unicode_funcs(buffer.get(), hb_icu_get_unicode_funcs());
    hb_buffer_pre_allocate(buffer.get(), length);

    /*
    // DEBUG
    std::vector<std::string> names = font_engine_.face_names();
    std::vector<std::string>::const_iterator itr;
    for (itr = names.begin(); itr != names.end(); ++itr) {
        std::cout<<*itr<<'\n';
    }
    */

    std::vector<std::pair<std::string, face_ptr>> faces;
    HarfbuzzShaper::Split(fontstack, ',', faces);

    face_set_ptr face_set = font_manager_.get_face_set(faces.back().first);

    font_face_set::iterator face_itr = face_set->begin(), face_end = face_set->end();
    for (; face_itr != face_end; ++face_itr) {
        hb_buffer_clear_contents(buffer.get());
        hb_buffer_add_utf16(buffer.get(), text.getBuffer(), text.length(), 0, length);
        // hb_buffer_set_direction(buffer.get(), (text_item.rtl == UBIDI_RTL)?HB_DIRECTION_RTL:HB_DIRECTION_LTR);
        hb_buffer_set_direction(buffer.get(), HB_DIRECTION_LTR);
        // hb_buffer_set_script(buffer.get(), hb_icu_script_to_script(text_item.script));
        face_ptr const& face = *face_itr;
        hb_font_t *font(hb_ft_font_create(face->get_face(), nullptr));
        hb_shape(font, buffer.get(), NULL, 0);
        hb_font_destroy(font);

        unsigned num_glyphs = hb_buffer_get_length(buffer.get());

        hb_glyph_info_t *glyphs = hb_buffer_get_glyph_infos(buffer.get(), nullptr);
        hb_glyph_position_t *positions = hb_buffer_get_glyph_positions(buffer.get(), nullptr);

        bool font_has_all_glyphs = true;
        // Check if all glyphs are valid.
        for (unsigned i = 0; i < num_glyphs; ++i) {
            if (!glyphs[i].codepoint) {
                std::cout<<face_itr->get()->family_name()<<" "<<face_itr->get()->style_name()<<" is missing glyph: "<<glyphs[i].codepoint<<'\n';
                font_has_all_glyphs = false;
                break;
            }
        }

        if (!font_has_all_glyphs && face_itr+1 != face_end) {
            //Try next font in fontset
            continue;
        }

        for (unsigned i = 0; i < num_glyphs; ++i) {
            glyph_info tmp;
            tmp.char_index = glyphs[i].cluster;
            tmp.glyph_index = glyphs[i].codepoint;
            tmp.face = face;
            face->glyph_dimensions(tmp);

            // DEBUG
            /*
            std::cout<<"Bit shift right 6: "<<(positions[i].x_advance >> 6)<<'\n';
            std::cout<<"Divide by 64.0: "<<(positions[i].x_advance >> 6)<<'\n';
            */

            // tmp.width = positions[i].x_advance / 64.0; // Overwrite default width with better value provided by HarfBuzz
            tmp.width = positions[i].x_advance >> 6;
            tmp.offset.set(positions[i].x_offset / 64.0, positions[i].y_offset / 64.0);
            // width_map[glyphs[i].cluster] += tmp.width;
            line.add_glyph(tmp, scale_factor);
        }

        line.update_max_char_height(face->get_char_height());

        // When we reach this point the current font had all glyphs.
        break; 
    }
}

std::vector<std::pair<std::string, face_ptr>> HarfbuzzShaper::Split(const std::string &s, char delim, std::vector<std::pair<std::string, face_ptr>> &elems) {
    std::stringstream ss(s);
    std::string item;
    std::pair<std::string, face_ptr> face;

    while (std::getline(ss, item, delim)) {
        face = std::make_pair(item, font_manager_.get_face(item));
        elems.push_back(face);
    }

    return elems;
}
