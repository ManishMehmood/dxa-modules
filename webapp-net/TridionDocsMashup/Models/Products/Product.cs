﻿using Sdl.Web.Common.Models;
using System;
using System.Collections.Generic;

namespace Sdl.Web.Modules.TridionDocsMashup.Models.Products
{
    /// <summary>
    /// This is the base class for every product type
    /// </summary>
    [Serializable]
    public abstract class Product : EntityModel
    {
        [SemanticProperty("_all")]
        public Dictionary<string, KeywordModel> Keywords { get; set; }

        [SemanticProperty("Title")]
        public string Title { get; set; }

        [SemanticProperty("Body")]
        public RichText Body { get; set; }

        [SemanticProperty("Image")]
        public MediaItem Image { get; set; }

    }
}