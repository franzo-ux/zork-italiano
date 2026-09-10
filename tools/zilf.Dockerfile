FROM mcr.microsoft.com/dotnet/sdk:10.0
RUN git clone --depth 1 https://github.com/taradinoc/zilf.git /opt/zilf \
 && dotnet build /opt/zilf/Zilf.sln --nologo -v:q
ENTRYPOINT ["dotnet", "/opt/zilf/bin/Debug/net10.0/zilf.dll"]
