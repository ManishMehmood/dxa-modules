﻿using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Threading;
using System.Web;
using FiftyOne.Foundation.Mobile.Detection;
using Sdl.Web.Common.Configuration;
using Sdl.Web.Common.Interfaces;
using Sdl.Web.Common.Logging;
using Sdl.Web.Context.Api.Types;

namespace Sdl.Web.Modules.Degrees51
{
    /// <summary>
    /// 51 Degrees claim provider
    /// 
    /// Configuration:   
    /// 
    /// <configuration>
    ///     <configSections>
    ///         <sectionGroup name="fiftyOne" type="System.Configuration.ApplicationSettingsGroup">
    ///             <section name="detection" type="FiftyOne.Foundation.Mobile.Detection.Configuration.DetectionSection, FiftyOne.Foundation" requirePermission="false" allowDefinition="Everywhere" restartOnExternalChanges="false" allowExeDefinition="MachineToApplication" />
    ///         </sectionGroup>
    ///     </configSections>
    ///     ...
    ///     ...
    ///     <fiftyOne>
    ///         <detection enabled="true" shareUsage="false" autoUpdate="true" binaryFilePath="~/App_Data/51Degrees.dat" />
    ///     </fiftyOne>
    ///
    /// </configuration>
    /// </summary>
    public class Degrees51ContextClaimsProvider : IContextClaimsProvider
    {            
        private readonly IAspectMap[] _properties;
        public Degrees51ContextClaimsProvider()
        {        
            // perform mapping of 51 degrees to context claims
            _properties = new IAspectMap[] 
            { 
               new AspectMap<string> { Aspect = "os", Name = "vendor", Build = ()=>GetProperty<string>("PlatformVendor") },
               new AspectMap<string> { Aspect = "os", Name = "model", Build = ()=>GetProperty<string>("PlatformName") },
               new AspectMap<GenericVersion> { Aspect = "os", Name = "version", Build = ()=> new GenericVersion(GetProperty<int>("PlatformVersion"))},
               new AspectMap<string> { Aspect = "userRequest", Name = "fullUrl", Build = ()=>"" },
               new AspectMap<bool> { Aspect = "ui", Name = "android", Build = ()=> {
                    string p = GetProperty<string>("PlatformVendor");
                    return p.Equals("android", StringComparison.InvariantCultureIgnoreCase);
               }},
               new AspectMap<bool> { Aspect = "ui", Name = "largeBrowser", Build = ()=> {
                    string p = GetProperty<string>("DeviceType");
                    return p.Equals("desktop", StringComparison.InvariantCultureIgnoreCase);
               }},
               new AspectMap<int> { Aspect = "browser", Name = "displayWidth", Build = ()=>GetContextProperty<int>("bw") },
               new AspectMap<int> { Aspect = "browser", Name = "displayHeight", Build = ()=>GetContextProperty<int>("bh") },
               new AspectMap<int> { Aspect = "browser", Name = "displayColorDepth", Build = ()=>GetContextProperty<int>("bcd")},
               new AspectMap<bool> { Aspect = "browser", Name = "cookieSupport", Build = ()=>GetProperty<bool>("CookiesCapable") },
               new AspectMap<HashSet<string>> { Aspect = "browser", Name = "stylesheetSupport", Build = ()=> {
                   // how do we know? 
                   HashSet<string> h = new HashSet<string> { "css10", "css21" };
                   if (GetProperty<bool>("CssBackground") || GetProperty<bool>("CssColor") || GetProperty<bool>("CssColumn") || GetProperty<bool>("CssFont") || GetProperty<bool>("CssImages") || GetProperty<bool>("CssText") || GetProperty<bool>("CssTransitions"))
                       h.Add("css30");
                   return h;
               }},
               new AspectMap<HashSet<string>> { Aspect = "browser", Name = "inputModeSupport", Build = ()=> new HashSet<string>{"useInputmodeAttribute"}},
               new AspectMap<GenericVersion> { Aspect = "browser", Name = "jsVersion", Build = ()=> new GenericVersion(0)},
               new AspectMap<GenericVersion> { Aspect = "browser", Name = "cssVersion", Build = ()=> new GenericVersion(0)},
               new AspectMap<GenericVersion> { Aspect = "browser", Name = "version", Build = ()=> new GenericVersion(0)},
               new AspectMap<HashSet<string>> { Aspect = "browser", Name = "scriptSupport", Build = ()=> {
                   HashSet<string> h = new HashSet<string>();
                   if (GetProperty<bool>("Javascript")) h.Add("Javascript");
                   return h;
               }},
               new AspectMap<HashSet<string>> { Aspect = "browser", Name = "inputDevices", Build = ()=> new HashSet<string>()},
               new AspectMap<HashSet<string>> { Aspect = "browser", Name = "imageFormatSupport", Build = ()=> new HashSet<string>()},
               new AspectMap<HashSet<string>> { Aspect = "browser", Name = "markupSupport", Build = ()=> {
                   HashSet<string> h = new HashSet<string>(); 
                   if(GetProperty<bool>("Html5"))
                   {
                       h.Add("HTML5");
                   }
                   return h;
               }},
               new AspectMap<string> { Aspect = "browser", Name = "vendor", Build = ()=>GetProperty<string>("BrowserVendor") },
               new AspectMap<string> { Aspect = "browser", Name = "preferredHtmlContentType", Build = ()=>GetProperty<string>("") },
               new AspectMap<string> { Aspect = "browser", Name = "variant", Build = ()=>GetProperty<string>("") },
               new AspectMap<string> { Aspect = "browser", Name = "model", Build = ()=>GetProperty<string>("BrowserName") },
               new AspectMap<string> { Aspect = "browser", Name = "modelAndOS", Build = ()=> $"{GetProperty<string>("PlatformName")} {GetProperty<string>("PlatformVersion")} {GetProperty<string>("BrowserName")}"},
               new AspectMap<string> { Aspect = "userHttp", Name = "cacheControl", Build = ()=> "" },
               new AspectMap<string> { Aspect = "userServer", Name = "remoteUser", Build = ()=> "" },
               new AspectMap<string> { Aspect = "userServer", Name = "serverPort", Build = ()=> "" },
               new AspectMap<bool> { Aspect = "device", Name = "mobile", Build = ()=>GetProperty<bool>("IsMobile") },
               new AspectMap<bool> { Aspect = "device", Name = "robot", Build = ()=>GetProperty<bool>("IsCrawler") },
               new AspectMap<bool> { Aspect = "device", Name = "tablet", Build = ()=>GetProperty<bool>("IsTablet") },
               new AspectMap<bool> { Aspect = "device", Name = "4g", Build = ()=>false },
               new AspectMap<int> { Aspect = "device", Name = "displayHeight", Build = ()=>GetContextProperty<int>("dh") },
               new AspectMap<int> { Aspect = "device", Name = "displayWidth", Build = ()=>GetContextProperty<int>("dw") },
               new AspectMap<int> { Aspect = "device", Name = "pixelDensity", Build = ()=> 1},
               new AspectMap<double> { Aspect = "device", Name = "pixelRatio", Build = ()=>GetContextProperty<double>("dpr") },
               new AspectMap<GenericVersion> { Aspect = "device", Name = "version", Build = ()=> new GenericVersion(0)},
               new AspectMap<HashSet<string>> { Aspect = "device", Name = "inputDevices", Build = ()=> {
                   HashSet<string> h = new HashSet<string>();                
                   if(GetProperty<string>("DeviceType").Equals("desktop", StringComparison.InvariantCultureIgnoreCase))
                   {
                       h.Add("keyboard");
                       h.Add("mouse");
                   }

                   if (GetProperty<bool>("HasClickWheel")) h.Add("clickwheel");                   
                   if (GetProperty<bool>("HasKeypad")) h.Add("keypad");
                   if (GetProperty<bool>("HasTouchScreen")) h.Add("touchscreen");
                   if (GetProperty<bool>("HasTrackpad")) h.Add("trackpad");
                   return h;
               }},
               new AspectMap<string> { Aspect = "device", Name = "vendor", Build = ()=>GetProperty<string>("PlatformVendor") },
               new AspectMap<string> { Aspect = "device", Name = "variant", Build = ()=>GetProperty<string>("DeviceType") },
               new AspectMap<string> { Aspect = "device", Name = "model", Build = ()=>GetProperty<string>("BrowserName") }
            };
        }

        protected bool PerformUpdateRequest(string key)
        {
            if (HttpContext.Current != null)
            {
                int h = key.GetHashCode();
                if(WebProvider.ActiveProvider!=null)
                {
                    Log.Info($"Current 51 Degrees DataSet name: '{WebProvider.ActiveProvider.DataSet.Name}'");
                }
                return !HttpContext.Current.Items.Contains(key.GetHashCode()) && (WebProvider.ActiveProvider == null || WebProvider.ActiveProvider.DataSet.Name == "Lite");
            }
            return false;
        }
     
        public IDictionary<string, object> GetContextClaims(string aspectName, Localization localization)
        {
            try
            {
                string key = localization.GetConfigValue("51degrees.licenseKey");
                if (!string.IsNullOrEmpty(key))
                {
                    Log.Info("Found 51 Degrees licence key.");

                    // add key to dynamic licences so the update thread can handle updating
                    LicenceKey.AddKey(key);
                    if (PerformUpdateRequest(key))
                    {
                        Log.Info("51 Degrees DataSet is out of date so requesting latest one with supplied licence key.");
                        HttpContext.Current.Items[key.GetHashCode()] = true;
                        ThreadPool.QueueUserWorkItem(_ =>
                        {
                            LicenceKey.Activate(key);
                        });
                    }
                }
                else
                {
                    // no big deal if no license key
                    Log.Warn("51degrees.licenseKey key has not been populated.");
                }
            }
            catch(Exception ex)
            {
                Log.Error("An error occured when attempted to access the 51degrees.licenseKey configuration setting.", ex);
                if (WebProvider.ActiveProvider != null)
                {
                    Log.Info($"Current 51 Degrees DataSet name: '{WebProvider.ActiveProvider.DataSet.Name}'");
                }
            }
            
            // grab all the properties from the data set and map to context claims
            Dictionary<string, object> claims = new Dictionary<string, object>();
            foreach (IAspectMap x in _properties)
            {
                object v = x.Value;
                claims.Add($"{x.Aspect}.{x.Name}", v);
            }

            return claims;
        }

        public string GetDeviceFamily()
        {
            // returning null will force the default implementation
            return null;
        }

        private T GetContextProperty<T>(string propertyName)
        {
            Dictionary<string, string> context = new Dictionary<string, string>();
            //context=dpr~1|dw~1600|dh~900|bcd~24|bw~1600|bh~775|version~1|; 
            HttpCookie cookie = HttpContext.Current.Request.Cookies["context"];
            if (cookie != null)
            {
                string[] values = cookie.Value.Split(new char[] { '|' }, StringSplitOptions.RemoveEmptyEntries);
                foreach (string s in values)
                {
                    string[] v = s.Split(new char[] { '~' }, StringSplitOptions.RemoveEmptyEntries);
                    context.Add(v[0], v[1]);
                }
            }
            return (T)TypeDescriptor.GetConverter(typeof(T)).ConvertFromInvariantString(context[propertyName]);
        }

        private T GetProperty<T>(string propertyName)
        {
            if (!string.IsNullOrEmpty(propertyName))
            {
                try
                {
                    var value = WebProvider.ActiveProvider.Match(
                        HttpContext.Current.Request.UserAgent)[propertyName];
                    if (value == null) return default(T);
                    if (typeof(T) == typeof(bool))
                        return (T)((object)value.ToBool());
                    if (typeof(T) == typeof(int))
                        return (T)((object)value.ToInt());
                    if (typeof(T) == typeof(double))
                        return (T)((object)value.ToDouble());
                    if (typeof(T) == typeof(string))
                        return (T)((object)value.ToString());
                }
                catch (Exception ex)
                {
                    Log.Error($"Failed to read property '{propertyName}' from 51 Degrees.", ex);
                }
            }
            return default(T);
        }
      
        private interface IAspectMap
        {
            string Aspect { get; set; }
            string Name { get; set; }
            Func<object> Build { get; set; }
            object Value { get; }
        }

        private class AspectMap<T> : IAspectMap
        {
            public string Aspect { get; set; }
            public string Name { get; set; }
            public Func<object> Build { get; set; }
            public object Value => ValueInternal;

            private T ValueInternal
            {
                get
                {
                    if (Build != null)
                    {
                        object v = null;
                        try
                        {                           
                            v = Build();
                        }
                        catch
                        {
                            // ignore
                        }
                        if (v != null)
                        {                            
                            if (v.GetType() == typeof(string))
                            {
                                string s = (string)v;
                                if (!string.IsNullOrEmpty(s))
                                {
                                    return (T)TypeDescriptor.GetConverter(typeof(T)).ConvertFromInvariantString(s);
                                }
                            }
                            else
                            {
                                return (T)v;
                            }
                        }
                    }

                    if (typeof(T) == typeof(string))
                        return (T)((object)string.Empty);

                    return default(T);
                }
            }
        }
    }
}
