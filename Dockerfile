FROM amazonlinux:1
WORKDIR /tmp
RUN yum -y install gcc-c++ && yum -y install findutils
RUN touch ~/.bashrc && chmod +x ~/.bashrc
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.39.1/install.sh | bash
RUN source ~/.bashrc && nvm install 14
WORKDIR /build