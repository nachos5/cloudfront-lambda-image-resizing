FROM amazonlinux:1
WORKDIR /tmp
RUN yum -y install gcc-c++ && yum -y install findutils
RUN touch ~/.bashrc && chmod +x ~/.bashrc
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.35.3/install.sh | bash
RUN source ~/.bashrc && nvm install 12
WORKDIR /build